import { InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { InstanceSignature, OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';

/**
 * Collection of Bull Tasks for the ActionSets
 */
@Injectable()
export class ActionSetsTasks implements OnModuleInit {
    /**
     * Dependency Injection
     *
     * @param actionSetsService
     * @param loggerService
     * @param actionQueue
     * @param outrospectionService
     * @param shutdownService
     */
    constructor(
        private readonly actionSetsService: ActionSetsService,
        private readonly loggerService: WinstonLoggerService,
        @InjectQueue('action') private readonly actionQueue: Queue,
        private readonly outrospectionService: OutrospectionService,
        private readonly shutdownService: ShutdownService,
    ) {}

    /**
     * Internal utility called when status of an actionset changes
     *
     * @param actionSet
     */
    private async onStatusChanged(actionSet: ActionSet): Promise<void> {
        switch (actionSet.status) {
            case 'complete': {
                const completeLifecycleCallbackRes = await this.actionSetsService.onComplete(actionSet);

                if (completeLifecycleCallbackRes.error) {
                    throw new Error(
                        `Error while running onComplete actionset lifecycle: ${completeLifecycleCallbackRes.error}`,
                    );
                }
                break;
            }
            default: {
                break;
            }
        }
    }

    /**
     * Process to handle the input actions
     *
     * @param job
     */
    async input(job: Job<ActionSetEntity>): Promise<void> {
        const actionSet: ActionSet = new ActionSet().load(job.data);

        for (let idx = actionSet.current_action; idx < actionSet.actions.length; idx++) {
            if (this.actionSetsService.getInputHandler(actionSet.action.name) === undefined) {
                const error = Error(
                    `Cannot find input handler for action ${actionSet.action.name} in actionset ${actionSet.id}`,
                );
                this.loggerService.error(error);
                throw error;
            }

            const callIdx = actionSet.current_action;
            const beforeStatus = actionSet.status;

            this.loggerService.log(`Calling ${actionSet.action.name} on ActionSet@${actionSet.id}`);
            const inputHandlerRes = await this.actionSetsService.getInputHandler(actionSet.action.name)(
                actionSet,
                job.progress.bind(job),
            );

            const updatedActionSet = inputHandlerRes[0];
            const update = inputHandlerRes[1];

            if (update) {
                const query = updatedActionSet.getQuery();
                const body = updatedActionSet.withoutQuery();

                await this.actionSetsService.update(query, body);
            }

            if (updatedActionSet.status !== beforeStatus) {
                await this.onStatusChanged(updatedActionSet);
            }

            if (
                updatedActionSet.actions[updatedActionSet.current_action].type === 'event' ||
                !(updatedActionSet.current_action > callIdx && updatedActionSet.action.data !== null)
            ) {
                break;
            }
        }
    }

    /**
     * Process to handle the event actions
     *
     * @param job
     */
    async event(job: Job<ActionSetEntity>): Promise<void> {
        const actionSet: ActionSet = new ActionSet().load(job.data);

        if (this.actionSetsService.getEventHandler(actionSet.action.name) === undefined) {
            const error = Error(
                `Cannot find event handler for action ${actionSet.action.name} in actionset ${actionSet.id}`,
            );
            this.loggerService.error(error);
            throw error;
        }

        const beforeStatus = actionSet.status;

        this.loggerService.log(`Calling ${actionSet.action.name} on ActionSet@${actionSet.id}`);
        const inputHandlerRes = await this.actionSetsService.getEventHandler(actionSet.action.name)(
            actionSet,
            job.progress.bind(job),
        );

        const updatedActionSet = inputHandlerRes[0];
        const update = inputHandlerRes[1];

        if (update) {
            const query = updatedActionSet.getQuery();
            const body = updatedActionSet.withoutQuery();

            await this.actionSetsService.update(query, body);
        }

        if (updatedActionSet.status !== beforeStatus) {
            await this.onStatusChanged(updatedActionSet);
        }
    }

    /**
     * Subscribes worker instances only
     */
    /* istanbul ignore next */
    async onModuleInit(): Promise<void> {
        const signature: InstanceSignature = await this.outrospectionService.getInstanceSignature();

        if (signature.name === 'worker') {
            this.actionQueue
                .process('input', 1000, this.input.bind(this))
                .then(() => console.log(`Closing Bull Queue @@action`))
                .catch(this.shutdownService.shutdownWithError);
            this.actionQueue
                .process('event', 1000, this.event.bind(this))
                .then(() => console.log(`Closing Bull Queue @@action`))
                .catch(this.shutdownService.shutdownWithError);
        }
    }
}
