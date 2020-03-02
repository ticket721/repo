import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { StripeResourceEntity } from '@lib/common/striperesources/entities/StripeResource.entity';

/**
 * Repository to handle the Stripe Resources
 */
@EntityRepository(StripeResourceEntity)
export class StripeResourcesRepository extends Repository<StripeResourceEntity> {}
