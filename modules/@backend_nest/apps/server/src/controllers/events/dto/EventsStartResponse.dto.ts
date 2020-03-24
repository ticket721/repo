import { EventDto } from '@app/server/controllers/events/dto/Event.dto';

/**
 * Data model returned after event start query
 */
export class EventsStartResponseDto {
    /**
     * Updated event entity
     */
    event: EventDto;
}
