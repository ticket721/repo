import { DateEntity } from '@lib/common/dates/entities/Date.entity';

/**
 * Data model returned when deleting a category to a date
 */
export class DatesDeleteCategoriesResponseDto {
    /**
     * Updated date
     */
    date: DateEntity;
}
