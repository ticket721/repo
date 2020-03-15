import { EventEntity } from '@lib/common/events/entities/Event.entity';

/**
 * Data Model returns by the Events search
 */
export class EventsSearchResponseDto {
    /**
     * Events matching the query
     */
    events: EventEntity[];
}
