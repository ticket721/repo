import { TxEntity } from '@lib/common/txs/entities/Tx.entity';

/**
 * Data Model returned when subscribing to a transaction
 */
export class TxsSubscribeResponseDto {
    /**
     * Transaction details. Will be almost empty unless it is already stored
     */
    tx: TxEntity;
}
