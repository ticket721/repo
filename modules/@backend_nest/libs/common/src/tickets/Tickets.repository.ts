import { EntityRepository, Repository } from '@iaminfinity/express-cassandra';
import { TicketEntity }                 from '@lib/common/tickets/entities/Ticket.entity';

/**
 * Repository to handle the Stripe Resources
 */
@EntityRepository(TicketEntity)
export class TicketsRepository extends Repository<TicketEntity> {}
