import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';

/**
 * Ticket search query result
 */
export class TicketsSearchResponseDto {
    /**
     * List of tickets matching query
     */
    tickets: TicketEntity[];
}
