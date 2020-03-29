import { EventEntity } from '@lib/common/events/entities/Event.entity';

/**
 * Data model returned when deleting dates from event
 */
export class EventsDeleteDatesResponseDto {
    /**
     * Updated event
     */
    event: EventEntity;
}
