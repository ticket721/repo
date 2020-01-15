import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { Injectable } from '@nestjs/common';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet';

/**
 * Collection of Bull Tasks for the ActionSets
 */
@Injectable()
@Processor('action')
export class ActionSetsTasks {
    /**
     * Dependency Injection
     *
     * @param actionSetsService
     */
    constructor(private readonly actionSetsService: ActionSetsService) {}

    /**
     * Process to handle the input actions
     */
    @Process({
        name: 'input',
        concurrency: 1,
    })
    async input(job: Job<ActionSetEntity>): Promise<void> {
        const actionSet: ActionSet = new ActionSet().load(job.data);

        if (
            this.actionSetsService.getInputHandler(actionSet.action.name) ===
            undefined
        ) {
            throw new Error(
                `Cannot find input handler for action ${actionSet.action.name} in actionset ${actionSet.id}`,
            );
        }

        const [
            updatedActionSet,
            update,
        ] = await this.actionSetsService.getInputHandler(actionSet.action.name)(
            actionSet,
            job.progress,
        );

        if (update) {
            const query = updatedActionSet.getQuery();
            const body = updatedActionSet.withoutQuery();

            await this.actionSetsService.update(query, body);
        }
    }
}
