import { TxEntity } from '@lib/common/txs/entities/Tx.entity';

/**
 * Data Model returned when broadcasting a meta transaction
 */
export class TxsMtxResponseDto {
    /**
     * Broadcasted Tx entity
     */
    tx: TxEntity;
}
