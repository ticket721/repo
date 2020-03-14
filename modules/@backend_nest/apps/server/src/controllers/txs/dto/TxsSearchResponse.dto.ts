import { TxEntity } from '@lib/common/txs/entities/Tx.entity';

/**
 * Data Model returned by the Transaction search
 */
export class TxsSearchResponseDto {
    /**
     * Transactions matching the query
     */
    txs: TxEntity[];
}
