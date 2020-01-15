import { CRUDExtension } from '@lib/common/crud/CRUD.extension';
import { Inject, Injectable } from '@nestjs/common';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import {
    BaseModel,
    InjectModel,
    InjectRepository,
} from '@iaminfinity/express-cassandra';
import { ActionSetsRepository } from '@lib/common/actionsets/ActionSets.repository';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet';

export type InputActionHandler = (
    actionSet: ActionSet,
    progress: (p: number) => Promise<void>,
) => Promise<[ActionSet, boolean]>;

/**
 * ActionSets Service, implements CRUD
 */
@Injectable()
export class ActionSetsService extends CRUDExtension<
    ActionSetsRepository,
    ActionSetEntity
> {
    /**
     * Dependency Injection
     *
     * @param actionSetsRepository
     * @param actionSetEntity
     * @param inputHandlers
     */
    constructor(
        @InjectRepository(ActionSetsRepository)
        actionSetsRepository: ActionSetsRepository,
        @InjectModel(ActionSetEntity)
        actionSetEntity: BaseModel<ActionSetEntity>,
        @Inject('ACTIONSETS_INPUT_HANDLERS')
        inputHandlers: { name: string; handler: InputActionHandler }[],
    ) {
        super(actionSetEntity, actionSetsRepository);
        for (const handler of inputHandlers) {
            this.setInputHandler(handler.name, handler.handler);
        }
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
