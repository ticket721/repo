import { DateEntity } from '@lib/common/dates/entities/Date.entity';

/**
 * Data model returned when updating a date
 */
export class DatesUpdateResponseDto {
    /**
     * Updated date
     */
    date: DateEntity;
}
