import { EventEntity } from '@lib/common/events/entities/Event.entity';

/**
 * Data model returned when editing an event
 */
export class EventsEditResponseDto {
    /**
     * Updated event entity
     */
    event: EventEntity;
}
