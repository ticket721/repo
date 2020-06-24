import { ESCountReturn } from '@lib/common/utils/ESCountReturn.type';

/**
 * Data Model returns by the Categories count
 */
export class CategoriesCountResponseDto {
    /**
     * Categories matching the query
     */
    categories: ESCountReturn;
}
