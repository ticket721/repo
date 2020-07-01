import { ESCountReturn } from '@lib/common/utils/ESCountReturn.type';

/**
 * Dosojin Model returns by the dosojin count
 */
export class DosojinCountResponseDto {
    /**
     * gemOrders matching the query
     */
    gemOrders: ESCountReturn;
}