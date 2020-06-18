import { ESCountReturn } from '@lib/common/utils/ESCountReturn.type';

/**
 * Data Model returns by the Dates count
 */
export class DatesCountResponseDto {
    /**
     * Dates matching the query
     */
    dates: ESCountReturn;
}
