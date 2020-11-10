import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { ErrorNode } from '@common/global';

/**
 * Data model returned when adding a new date
 */
export class EventsAddDateResponseDto {
    /**
     * Possible errors due to date creation
     */
    error?: ErrorNode;
    /**
     * Created date entity
     */
    date?: DateEntity;
}
