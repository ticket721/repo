import { InvitationEntity } from '@lib/common/invitations/entities/Invitation.entity';
import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';

/**
 * Repository to handle the Stripe Resources
 */
@EntityRepository(InvitationEntity)
export class InvitationsRepository extends Repository<InvitationEntity> {}
