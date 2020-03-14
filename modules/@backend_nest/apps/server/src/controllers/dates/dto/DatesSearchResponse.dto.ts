import { DateEntity } from '@lib/common/dates/entities/Date.entity';

/**
 * Response provided by the Date search
 */
export class DatesSearchResponseDto {
    /**
     * Dates matching the input query
     */
    dates: DateEntity[];
}
