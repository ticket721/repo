import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { GlobalEntity } from '@lib/common/globalconfig/entities/Global.entity';

/**
 * Repository of the TxEntity
 */
@EntityRepository(GlobalEntity)
export class GlobalConfigRepository extends Repository<GlobalEntity> {}
