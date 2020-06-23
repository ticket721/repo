import { DateEntity } from '@lib/common/dates/entities/Date.entity';

/**
 * Response provided by the Date home search
 */
export class DatesHomeSearchResponseDto {
    /**
     * Dates matching the input query
     */
    dates: DateEntity[];
}
