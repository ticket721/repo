import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { RightEntity } from '@lib/common/rights/entities/Right.entity';

/**
 * Repository of the RightEntity
 */
@EntityRepository(RightEntity)
export class RightsRepository extends Repository<RightEntity> {}
