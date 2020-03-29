import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { Injectable } from '@nestjs/common';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { ActionSetsRepository } from '@lib/common/actionsets/ActionSets.repository';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { ActionSetBuilderBase } from '@lib/common/actionsets/helper/ActionSet.builder.base';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { ModuleRef } from '@nestjs/core';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { RightsService } from '@lib/common/rights/Rights.service';

/**
 * Progress Type
 */
export type Progress = (p: number) => Promise<void>;

/**
 * Handler for the Input Actions of the Action Sets
 */
export type InputActionHandler = (actionSet: ActionSet, progress: Progress) => Promise<[ActionSet, boolean]>;

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
     */
    constructor(
        @InjectRepository(ActionSetsRepository)
        actionSetsRepository: ActionSetsRepository,
        @InjectModel(ActionSetEntity)
        actionSetEntity: BaseModel<ActionSetEntity>,
        private readonly moduleRef: ModuleRef,
        private readonly rightsService: RightsService,
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
     * Builds an actionset for a user by using a dynamically fetched builder
     *
     * @param name
     * @param caller
     * @param args
     */
    async build<BuildArgs = any>(
        name: string,
        caller: UserDto,
        args: BuildArgs,
    ): Promise<ServiceResponse<ActionSetEntity>> {
        let builder: ActionSetBuilderBase;

        try {
            builder = this.moduleRef.get(`ACTION_SET_BUILDER/${name}`);
        } catch (e) {
            return {
                error: 'unknown_builder',
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
}
