import { EventEntity } from '@lib/common/events/entities/Event.entity';

/**
 * Data model returned when binding a stripe interface to an event
 */
export class EventsBindStripeInterfaceResponseDto {
    /**
     * Updated event entity
     */
    event: EventEntity;
}
