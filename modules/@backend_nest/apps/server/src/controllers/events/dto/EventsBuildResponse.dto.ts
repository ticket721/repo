import { EventDto } from '@app/server/controllers/events/dto/Event.dto';

/**
 * Data Model returned after event build operations
 */
export class EventsBuildResponseDto {
    /**
     * Created Event
     */
    event: EventDto;
}
