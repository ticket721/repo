import { CRUDExtension } from '@lib/common/crud/CRUD.extension';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { EVMBlockRollbacksRepository } from '@lib/common/evmblockrollbacks/EVMBlockRollbacks.repository';
import { EVMBlockRollbackEntity } from '@lib/common/evmblockrollbacks/entities/EVMBlockRollback.entity';

/**
 * Service to CRUD EVMBlockRollbackEntities
 */
export class EVMBlockRollbacksService extends CRUDExtension<EVMBlockRollbacksRepository, EVMBlockRollbackEntity> {
    /**
     * Dependency Injection
     *
     * @param evmBlockRollbacksRepository
     * @param evmBlockRollbackEntity
     */
    /* istanbul ignore next */
    constructor(
        @InjectRepository(EVMBlockRollbacksRepository)
        evmBlockRollbacksRepository: EVMBlockRollbacksRepository,
        @InjectModel(EVMBlockRollbackEntity)
        evmBlockRollbackEntity: BaseModel<EVMBlockRollbackEntity>,
    ) {
        super(
            evmBlockRollbackEntity,
            evmBlockRollbacksRepository,
            /* istanbul ignore next */
            (e: EVMBlockRollbackEntity) => {
                return new evmBlockRollbackEntity(e);
            },
        );
    }
}
