import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { VenmasEntity } from '@lib/common/venmas/entities/Venmas.entity';

/**
 * Repository of the RightEntity
 */
@EntityRepository(VenmasEntity)
export class VenmasRepository extends Repository<VenmasEntity> {}
