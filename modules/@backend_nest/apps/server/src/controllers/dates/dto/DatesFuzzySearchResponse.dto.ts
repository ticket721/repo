import { DateEntity } from '@lib/common/dates/entities/Date.entity';

/**
 * Response provided by the Date fuzzy search
 */
export class DatesFuzzySearchResponseDto {
    /**
     * Dates matching the input query
     */
    dates: DateEntity[];
}
