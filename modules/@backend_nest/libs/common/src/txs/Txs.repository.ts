import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { TxEntity } from '@lib/common/txs/entities/Tx.entity';

/**
 * Repository of the TxEntity
 */
@EntityRepository(TxEntity)
export class TxsRepository extends Repository<TxEntity> {}
