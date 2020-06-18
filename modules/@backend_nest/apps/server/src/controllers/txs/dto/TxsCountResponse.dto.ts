import { ESCountReturn } from '@lib/common/utils/ESCountReturn.type';

/**
 * Data Model returns by the transaction count
 */
export class TxsCountResponseDto {
    /**
     * Transactions matching the query
     */
    txs: ESCountReturn;
}