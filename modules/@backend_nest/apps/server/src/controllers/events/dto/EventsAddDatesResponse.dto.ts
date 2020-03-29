import { EventEntity } from '@lib/common/events/entities/Event.entity';

/**
 * Date model returned when adding dates to event
 */
export class EventsAddDatesResponseDto {
    /**
     * Updated event
     */
    event: EventEntity;
}
