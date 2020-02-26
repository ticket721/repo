import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { EVMEventSetEntity } from '@lib/common/evmeventsets/entities/EVMEventSet.entity';

/**
 * Repository of the EVMEventSetEntity
 */
@EntityRepository(EVMEventSetEntity)
export class EVMEventSetsRepository extends Repository<EVMEventSetEntity> {}
