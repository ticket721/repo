import { EventDto } from '@app/server/controllers/events/dto/Event.dto';

/**
 * Data Model returned after events creation
 */
export class EventsBuildResponseDto {
    /**
     * Created ActionSet
     */
    event: EventDto;
}
