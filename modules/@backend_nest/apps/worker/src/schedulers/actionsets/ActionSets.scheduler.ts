import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectSchedule, Schedule } from 'nest-schedule';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';

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
     */
    constructor(
        // private readonly actionSetsService: ActionSetsService,
        // private readonly shutdownService: ShutdownService,
        // @InjectQueue('action') private readonly actionQueue: Queue,
        @InjectSchedule() private readonly schedule: Schedule,
        // private readonly loggerService: WinstonLoggerService,
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
            this.schedule.scheduleIntervalJob('eventDispatcher', 1000, this.eventDispatcher.bind(this));
        }
    }

    /**
     * Mandatory shutdown call to remove all scheduled jobs
     */
    /* istanbul ignore next */
    onModuleDestroy(): void {
        this.schedule.cancelJobs();
    }

    async eventDispatcher(): Promise<void> {
        // const bodyBuilder = ESSearchBodyBuilder({
        //     $page_size: 10000,
        //     current_status: {
        //         $eq: 'event:waiting',
        //     },
        //     dispatched_at: {
        //         $lt: 'now-5s',
        //     },
        // } as SortablePagedSearch);
    }
}
