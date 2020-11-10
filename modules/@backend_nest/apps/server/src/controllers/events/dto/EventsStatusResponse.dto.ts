import { EventEntity } from '@lib/common/events/entities/Event.entity';

/**
 * Data model returned when updating event statuses
 */
export class EventsStatusResponseDto {
    /**
     * Updated event entity
     */
    event: EventEntity;
}
