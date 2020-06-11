import { ESCountReturn } from '@lib/common/utils/ESCountReturn.type';

/**
 * Data Model returns by the Events search
 */
export class DatesCountResponseDto {
    /**
     * Dates matching the query
     */
    dates: ESCountReturn;
}