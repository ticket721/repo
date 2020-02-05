import { TxEntity } from '@lib/common/txs/entities/Tx.entity';

/**
 * Data Model returns by the Events search
 */
export class TxsSearchResponseDto {
    /**
     * Events matching the query
     */
    txs: TxEntity[];
}
