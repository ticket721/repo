import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';

/**
 * Repository to handle the Purchase
 */
@EntityRepository(PurchaseEntity)
export class PurchasesRepository extends Repository<PurchaseEntity> {}
