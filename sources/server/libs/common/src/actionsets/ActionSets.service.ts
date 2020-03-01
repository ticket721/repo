import { CRUDExtension } from '@lib/common/crud/CRUD.extension';
import { Injectable } from '@nestjs/common';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { ActionSetsRepository } from '@lib/common/actionsets/ActionSets.repository';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet';

export type Progress = (p: number) => Promise<void>;

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
     */
    constructor(
        @InjectRepository(ActionSetsRepository)
        actionSetsRepository: ActionSetsRepository,
        @InjectModel(ActionSetEntity)
        actionSetEntity: BaseModel<ActionSetEntity>,
    ) {
        super(
            actionSetEntity,
            actionSetsRepository,
            /* istanbul ignore next */
            (e: ActionSetEntity) => {
                return new actionSetEntity(e);
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
}
