import { ESCountReturn } from '@lib/common/utils/ESCountReturn.type';

/**
 * Data Model returns by the Events search
 */
export class EventsCountResponseDto {
    /**
     * Events matching the query
     */
    events: ESCountReturn;
}
