import { CRUDExtension } from '@lib/common/crud/CRUD.extension';
import { Injectable } from '@nestjs/common';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import {
    BaseModel,
    InjectModel,
    InjectRepository,
} from '@iaminfinity/express-cassandra';
import { ActionSetsRepository } from '@lib/common/actionsets/ActionSets.repository';

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
     */
    constructor(
        @InjectRepository(ActionSetsRepository)
        actionSetsRepository: ActionSetsRepository,
        @InjectModel(ActionSetEntity)
        actionSetEntity: BaseModel<ActionSetEntity>,
    ) {
        super(actionSetEntity, actionSetsRepository);
    }
}
