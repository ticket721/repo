import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { Injectable } from '@nestjs/common';
import { ActionSetEntity, ActionSetStatus } from '@lib/common/actionsets/entities/ActionSet.entity';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { ActionSetsRepository } from '@lib/common/actionsets/ActionSets.repository';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { ActionSetBuilderBase } from '@lib/common/actionsets/helper/ActionSet.builder.base';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { ModuleRef } from '@nestjs/core';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { RightsService } from '@lib/common/rights/Rights.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ActionSetLifecyclesBase } from '@lib/common/actionsets/helper/ActionSet.lifecycles.base';

/**
 * Progress Type
 */
export type Progress = (p: number) => Promise<void>;

/**
 * Handler for the Input Actions of the Action Sets
 */
export type InputActionHandler = (actionSet: ActionSet, progress: Progress) => Promise<[ActionSet, boolean]>;

/**
 * Handler for the Event Actions of the Action Sets
 */
export type EventActionHandler = (actionSet: ActionSet, progress: Progress) => Promise<[ActionSet, boolean]>;

/**
 * ActionSets Service, implements CRUD
 */
@Injectable()
export class ActionSetsService extends CRUDExtension<ActionSetsRepository, ActionSetEntity> {
    /**
     * Dependency Injection
     *
     * @param actionSetsRepository
     * @param actionSetEntity
     * @param moduleRef
     * @param rightsService
     * @param actionQueue
     */
    constructor(
        @InjectRepository(ActionSetsRepository)
        actionSetsRepository: ActionSetsRepository,
        @InjectModel(ActionSetEntity)
        actionSetEntity: BaseModel<ActionSetEntity>,
        private readonly moduleRef: ModuleRef,
        private readonly rightsService: RightsService,
        @InjectQueue('action') private readonly actionQueue: Queue,
    ) {
        super(
            actionSetEntity,
            actionSetsRepository,
            /* istanbul ignore next */
            (e: ActionSetEntity) => {
                return new actionSetEntity(e);
            },
            /* istanbul ignore next */
            (as: ActionSetEntity) => {
                return new ActionSetEntity(as);
            },
        );
    }

    /**
     * Input handlers that are called by the input bull tasks
     */
    private inputHandlers: {
        [key: string]: InputActionHandler;
    } = {};

    /**
     * Event handlers that are called by the event bull tasks
     */
    private eventHandlers: {
        [key: string]: EventActionHandler;
    } = {};

    /**
     * Sets a new input handler mapping
     *
     * @param name
     * @param handler
     */
    setInputHandler(name: string, handler: InputActionHandler): void {
        this.inputHandlers[name] = handler;
    }

    /**
     * Recover an input handler
     *
     * @param name
     */
    getInputHandler(name: string): InputActionHandler {
        return this.inputHandlers[name];
    }

    /**
     * Sets a new event handler mapping
     *
     * @param name
     * @param handler
     */
    setEventHandler(name: string, handler: EventActionHandler): void {
        this.eventHandlers[name] = handler;
    }

    /**
     * Recover an event handler
     *
     * @param name
     */
    getEventHandler(name: string): EventActionHandler {
        return this.eventHandlers[name];
    }

    /**
     * Builds an actionset for a user by using a dynamically fetched builder
     *
     * @param name
     * @param caller
     * @param args
     * @param internal
     */
    async build<BuildArgs = any>(
        name: string,
        caller: UserDto,
        args: BuildArgs,
        internal?: boolean,
    ): Promise<ServiceResponse<ActionSetEntity>> {
        let builder: ActionSetBuilderBase;

        try {
            builder = await this.moduleRef.get(`ACTION_SET_BUILDER/${name}`, { strict: false });
        } catch (e) {
            return {
                error: 'unknown_builder',
                response: null,
            };
        }

        if (!internal && builder.isPrivate) {
            return {
                error: 'cannot_create_private_actionset_in_public_context',
                response: null,
            };
        }

        const actionSetBuildingRes = await builder.buildActionSet(caller, args);

        if (actionSetBuildingRes.error) {
            return {
                error: actionSetBuildingRes.error,
                response: null,
            };
        }

        const actionSetCreationRes = await this.create(actionSetBuildingRes.response.raw);

        if (actionSetCreationRes.error) {
            return {
                error: actionSetCreationRes.error,
                response: null,
            };
        }

        const ownerRightsRes = await this.rightsService.addRights(caller, [
            {
                rights: {
                    owner: true,
                },
                entity: 'actionset',
                entityValue: actionSetCreationRes.response.id,
            },
        ]);

        if (ownerRightsRes.error) {
            return {
                error: ownerRightsRes.error,
                response: null,
            };
        }

        return {
            error: null,
            response: actionSetCreationRes.response,
        };
    }

    /**
     * Utility to extract the lifecycle callback from the provider if it exists, or do nothing
     *
     * @param actionSet
     */
    async onComplete(actionSet: ActionSet): Promise<ServiceResponse<void>> {
        let lifecycles: ActionSetLifecyclesBase;

        try {
            lifecycles = await this.moduleRef.get(`ACTION_SET_LIFECYCLES/${actionSet.name}`, { strict: false });
        } catch (e) {
            return {
                error: null,
                response: null,
            };
        }

        return lifecycles.onComplete(actionSet);
    }

    /**
     * Sets a specific step into error mode
     *
     * @param actionSetId
     * @param error
     * @param details
     * @param actionIdx
     */
    async errorStep(
        actionSetId: string,
        error: string,
        details: any,
        actionIdx: number,
    ): Promise<ServiceResponse<ActionSetEntity>> {
        const actionSetRes = await this.search({
            id: actionSetId,
        });

        if (actionSetRes.error) {
            return {
                error: actionSetRes.error,
                response: null,
            };
        }

        if (actionSetRes.response.length === 0) {
            return {
                error: 'actionset_not_found',
                response: null,
            };
        }

        const actionSet = new ActionSet().load(actionSetRes.response[0]);

        actionSet.actions[actionIdx].setError({
            details,
            error,
        });
        actionSet.actions[actionIdx].setStatus('error');
        actionSet.setStatus(`${actionSet.actions[actionIdx].type}:error` as ActionSetStatus);

        const updateRes = await this.update(actionSet.getQuery(), actionSet.withoutQuery());

        if (updateRes.error) {
            return {
                error: updateRes.error,
                response: null,
            };
        }

        return {
            error: null,
            response: actionSet.raw,
        };
    }

    /**
     * Method to update an action set step and trigger a bull task to check it
     *
     * @param actionSetId
     * @param actionIdx
     * @param data
     */
    async updateAction(
        actionSetId: string | ActionSet,
        actionIdx: number,
        data: any,
    ): Promise<ServiceResponse<ActionSetEntity>> {
        let actionSet;

        if (typeof actionSetId === 'object') {
            actionSet = actionSetId;
        } else {
            const actionSetRes = await this.search({
                id: actionSetId,
            });

            if (actionSetRes.error) {
                return {
                    error: actionSetRes.error,
                    response: null,
                };
            }

            if (actionSetRes.response.length === 0) {
                return {
                    error: 'actionset_not_found',
                    response: null,
                };
            }

            actionSet = new ActionSet().load(actionSetRes.response[0]);
        }

        actionSet.actions[actionIdx].setData(data);

        actionSet.setStatus(`${actionSet.actions[actionIdx].type}:waiting` as ActionSetStatus);
        actionSet.actions[actionIdx].setStatus('waiting');

        actionSet.setCurrentAction(actionIdx);

        const updateQuery = actionSet.getQuery();
        const updateBody = actionSet.withoutQuery();

        const actionSetUpdateRes = await this.update(updateQuery, {
            ...updateBody,
            dispatched_at: new Date(Date.now()),
        });

        if (actionSetUpdateRes.error) {
            return {
                error: actionSetUpdateRes.error,
                response: null,
            };
        }

        const updatedActionSet = await this.search({
            id: actionSet.id,
        });

        if (updatedActionSet.error) {
            return {
                error: updatedActionSet.error,
                response: null,
            };
        }

        await this.actionQueue.add('input', actionSet.raw);

        return {
            error: null,
            response: updatedActionSet.response[0],
        };
    }
}
