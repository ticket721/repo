import { EventEntity } from '@lib/common/events/entities/Event.entity';

/**
 * Data model returned when adding categories to event
 */
export class EventsAddCategoriesResponseDto {
    /**
     * Updated event
     */
    event: EventEntity;
}
