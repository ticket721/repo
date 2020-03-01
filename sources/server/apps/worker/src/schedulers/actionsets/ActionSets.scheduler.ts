import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectSchedule, Schedule } from 'nest-schedule';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { ESSearchBodyBuilder } from '@lib/common/utils/ESSearchBodyBuilder';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { fromES } from '@lib/common/utils/fromES';
import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { uuidEq } from '@ticket721sources/global';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';

/**
 * Collection of scheduled tasks
 */
@Injectable()
export class ActionSetsScheduler implements OnModuleInit, OnModuleDestroy {
    /**
     * Dependency injection
     *
     * @param actionSetsService
     * @param shutdownService
     * @param actionQueue
     * @param schedule
     * @param loggerService
     * @param outrospectionService
     */
    constructor(
        private readonly actionSetsService: ActionSetsService,
        private readonly shutdownService: ShutdownService,
        @InjectQueue('action') private readonly actionQueue: Queue,
        @InjectSchedule() private readonly schedule: Schedule,
        private readonly loggerService: WinstonLoggerService,
        private readonly outrospectionService: OutrospectionService,
    ) {}

    /**
     * By using the API instead of the decorator, we can easily test the tasks
     * without starting any background loop
     */
    /* istanbul ignore next */
    async onModuleInit(): Promise<void> {
        const signature = await this.outrospectionService.getInstanceSignature();

        if (signature.master === true && signature.name === 'worker') {
            this.schedule.scheduleIntervalJob('inputDispatcher', 1000, this.inputDispatcher.bind(this));
        }
    }

    /**
     * Mandatory shutdown call to remove all scheduled jobs
     */
    /* istanbul ignore next */
    onModuleDestroy(): void {
        this.schedule.cancelJobs();
    }

    /**
     * Task that fetches current input actions that needs to get resolved and
     * dispatches them in the action bull queue
     */
    async inputDispatcher(): Promise<void> {
        const bodyBuilder = ESSearchBodyBuilder({
            $page_size: 1000,
            current_status: {
                $eq: 'input:waiting',
            },
            dispatched_at: {
                $lt: 'now-5s',
            },
        } as SortablePagedSearch);

        const res = await this.actionSetsService.searchElastic(bodyBuilder.response);

        if (res.error) {
            return this.shutdownService.shutdownWithError(new Error('Error while requesting action sets'));
        }

        const dispatched = new Date(Date.now());
        const currentJobs = await this.actionQueue.getJobs(['active', 'waiting']);

        let count = 0;
        if (res.response.hits.total !== 0) {
            for (const hit of res.response.hits.hits) {
                const entity = fromES(hit);

                if (
                    currentJobs.findIndex((job: Job<ActionSetEntity>): boolean => uuidEq(job.data.id, entity.id)) !== -1
                ) {
                    continue;
                }

                ++count;
                await this.actionQueue.add('input', entity);
                const actionSet = new ActionSet().load(entity);
                await this.actionSetsService.update(actionSet.getQuery(), {
                    dispatched_at: dispatched,
                });
            }
        }

        if (count) {
            this.loggerService.log(`Dispatched ${count} ActionSets on the input queue`);
        }
    }
}
