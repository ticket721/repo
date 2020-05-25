import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectSchedule, Schedule } from 'nest-schedule';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { ConfigService }        from '@lib/common/config/Config.service';
import { ActionSetsService }    from '@lib/common/actionsets/ActionSets.service';
import { ShutdownService }      from '@lib/common/shutdown/Shutdown.service';
import { Job, Queue }           from 'bull';
import { InjectQueue }          from '@nestjs/bull';
import { fromES }               from '@lib/common/utils/fromES.helper';
import { ActionSetEntity }      from '@lib/common/actionsets/entities/ActionSet.entity';
import { uuidEq }               from '@common/global';
import { ActionSet }            from '@lib/common/actionsets/helper/ActionSet.class';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { TimeToolService }      from '@lib/common/toolbox/Time.tool.service';
import { NestError }            from '@lib/common/utils/NestError';

/**
 * Collection of scheduled tasks
 */
@Injectable()
export class ActionSetsScheduler implements OnModuleInit, OnModuleDestroy {
    /**
     * Dependency injection
     *
     * @param schedule
     * @param outrospectionService
     * @param configService
     * @param actionSetsService
     * @param shutdownService
     * @param actionQueue
     * @param loggerService
     * @param timeToolService
     */
    constructor(
        @InjectSchedule() private readonly schedule: Schedule,
        private readonly outrospectionService: OutrospectionService,
        private readonly configService: ConfigService,
        private readonly actionSetsService: ActionSetsService,
        private readonly shutdownService: ShutdownService,
        @InjectQueue('action') private readonly actionQueue: Queue,
        private readonly loggerService: WinstonLoggerService,
        private readonly timeToolService: TimeToolService,
    ) {}

    /**
     * By using the API instead of the decorator, we can easily test the tasks
     * without starting any background loop
     */
    /* istanbul ignore next */
    async onModuleInit(): Promise<void> {
        const signature = await this.outrospectionService.getInstanceSignature();

        if (signature.master === true && signature.name === 'worker') {
            this.schedule.scheduleIntervalJob('eventDispatcher', 1000, this.eventDispatcher.bind(this));
        }
    }

    /**
     * Background event dispatcher. Takes action sets in event mode and run them for an update round
     */
    async eventDispatcher(): Promise<void> {
        const batchSize = parseInt(this.configService.get('ACSET_EVENT_BATCH_SIZE'), 10);

        const query = {
            body: {
                size: batchSize,
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    current_status: 'event:in progress',
                                },
                            },
                            {
                                range: {
                                    dispatched_at: {
                                        lt: 'now-5s',
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        };

        const actionSetsSearchRes = await this.actionSetsService.searchElastic(query);

        if (actionSetsSearchRes.error) {
            return this.shutdownService.shutdownWithError(new NestError('Error while requesting action sets'));
        }

        const dispatched = this.timeToolService.now();
        const currentJobs = await this.actionQueue.getJobs(['active', 'waiting']);

        let count = 0;
        if (actionSetsSearchRes.response.hits.total !== 0) {
            for (const hit of actionSetsSearchRes.response.hits.hits) {
                const actionSetEntity = fromES(hit);

                if (
                    currentJobs.findIndex((job: Job<ActionSetEntity>): boolean =>
                        uuidEq(job.data.id, actionSetEntity.id),
                    ) !== -1
                ) {
                    continue;
                }

                ++count;
                await this.actionQueue.add('event', actionSetEntity);
                const actionSet = new ActionSet().load(actionSetEntity);
                await this.actionSetsService.update(actionSet.getQuery(), {
                    dispatched_at: dispatched,
                });
            }
        }

        if (count) {
            this.loggerService.log(`Dispatched ${count} ActionSets on the event queue`);
        }
    }

    /**
     * Mandatory shutdown call to remove all scheduled jobs
     */
    /* istanbul ignore next */
    onModuleDestroy(): void {
        this.schedule.cancelJobs();
    }
}
