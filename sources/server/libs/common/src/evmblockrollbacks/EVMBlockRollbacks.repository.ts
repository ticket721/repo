import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { EVMBlockRollbackEntity } from '@lib/common/evmblockrollbacks/entities/EVMBlockRollback.entity';

/**
 * Repository of the EVMBlockRollbackEntity
 */
@EntityRepository(EVMBlockRollbackEntity)
export class EVMBlockRollbacksRepository extends Repository<EVMBlockRollbackEntity> {}
