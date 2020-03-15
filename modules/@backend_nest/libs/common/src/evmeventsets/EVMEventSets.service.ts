import { CRUDExtension } from '@lib/common/crud/CRUD.extension';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { EVMEventSetsRepository } from '@lib/common/evmeventsets/EVMEventSets.repository';
import { EVMEventSetEntity } from '@lib/common/evmeventsets/entities/EVMEventSet.entity';

/**
 * Service to CRUD EVMEventSetEntities
 */
export class EVMEventSetsService extends CRUDExtension<EVMEventSetsRepository, EVMEventSetEntity> {
    /**
     * Dependency Injection
     *
     * @param evmEventSetsRepository
     * @param evmEventSetEntity
     */
    /* istanbul ignore next */
    constructor(
        @InjectRepository(EVMEventSetsRepository)
        evmEventSetsRepository: EVMEventSetsRepository,
        @InjectModel(EVMEventSetEntity)
        evmEventSetEntity: BaseModel<EVMEventSetEntity>,
    ) {
        super(
            evmEventSetEntity,
            evmEventSetsRepository,
            /* istanbul ignore next */
            (e: EVMEventSetEntity) => {
                return new evmEventSetEntity(e);
            },
        );
    }
}
