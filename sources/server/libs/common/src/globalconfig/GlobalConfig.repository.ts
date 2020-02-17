import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { GlobalEntity } from '@lib/common/globalconfig/entities/Global.entity';

/**
 * Repository of the GlobalEntity
 */
@EntityRepository(GlobalEntity)
export class GlobalConfigRepository extends Repository<GlobalEntity> {}
