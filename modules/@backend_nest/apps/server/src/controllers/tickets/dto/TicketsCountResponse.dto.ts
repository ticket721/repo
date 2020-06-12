import { ESCountReturn } from '@lib/common/utils/ESCountReturn.type';

/**
 * Data Model returns by the Events search
 */
export class TicketsCountResponseDto {
    /**
     * Categories matching the query
     */
    tickets: ESCountReturn;
}
