import { CRUDExtension } from '@lib/common/crud/CRUD.extension';
import { Injectable } from '@nestjs/common';
import { ActionSetEntity } from '@lib/common/actionsets/entity/ActionSet.entity';
import {
    BaseModel,
    InjectModel,
    InjectRepository,
} from '@iaminfinity/express-cassandra';
import { ActionSetsRepository } from '@lib/common/actionsets/ActionSets.repository';

@Injectable()
export class ActionSetsService extends CRUDExtension<
    ActionSetsRepository,
    ActionSetEntity
> {
    constructor(
        @InjectRepository(ActionSetsRepository)
        private readonly actionSetsRepository: ActionSetsRepository,
        @InjectModel(ActionSetEntity)
        private readonly actionSetEntity: BaseModel<ActionSetEntity>,
    ) {
        super(actionSetEntity, actionSetsRepository);
    }
}
