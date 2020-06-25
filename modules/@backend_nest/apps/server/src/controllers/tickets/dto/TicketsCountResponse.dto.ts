import { ESCountReturn } from '@lib/common/utils/ESCountReturn.type';

/**
 * Data Model returns by the Tickets count
 */
export class TicketsCountResponseDto {
    /**
     * Tickets matching the query
     */
    tickets: ESCountReturn;
}
