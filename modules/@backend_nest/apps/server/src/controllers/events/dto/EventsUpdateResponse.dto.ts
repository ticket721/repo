import { EventDto } from '@app/server/controllers/events/dto/Event.dto';

/**
 * Data model returned when updating an event
 */
export class EventsUpdateResponseDto {
    /**
     * Updated event
     */
    event: EventDto;
}
