import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { StripeInterfaceEntity } from '@lib/common/stripeinterface/entities/StripeInterface.entity';

/**
 * Repository of the StripeInterfaceEntity
 */
@EntityRepository(StripeInterfaceEntity)
export class StripeInterfacesRepository extends Repository<StripeInterfaceEntity> {}
