import { EventDto } from '@app/server/controllers/events/dto/Event.dto';
import { ErrorNode } from '@common/global';

/**
 * Data Model returned after event build operations
 */
export class EventsBuildResponseDto {
    /**
     * Created Event
     */
    event?: EventDto;

    /**
     * Possible creation error
     */
    error?: ErrorNode;
}
