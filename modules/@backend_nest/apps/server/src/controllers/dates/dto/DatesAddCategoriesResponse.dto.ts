import { DateEntity } from '@lib/common/dates/entities/Date.entity';

/**
 * Data Model returned when add a category to a date
 */
export class DatesAddCategoriesResponseDto {
    /**
     * Update date
     */
    date: DateEntity;
}
