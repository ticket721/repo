import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { GemOrderEntity } from '@lib/common/gemorders/entities/GemOrder.entity';

/**
 * Repository for the GemOrders Entities
 */
@EntityRepository(GemOrderEntity)
export class GemOrdersRepository extends Repository<GemOrderEntity> {}
