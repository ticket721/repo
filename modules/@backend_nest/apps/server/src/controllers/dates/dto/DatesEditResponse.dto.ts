import { DateEntity } from '@lib/common/dates/entities/Date.entity';

/**
 * Data model returned when editing a date
 */
export class DatesEditResponseDto {
    /**
     * Edited date
     */
    date: DateEntity;
}
