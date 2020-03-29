import { EventDto } from '@app/server/controllers/events/dto/Event.dto';

/**
 * Data model returned when deleting categories from event
 */
export class EventsDeleteCategoriesResponseDto {
    /**
     * Updated event
     */
    event: EventDto;
}
