import { Column, CreateDateColumn, Entity, UpdateDateColumn } from '@iaminfinity/express-cassandra';
import { ECAAG } from '@lib/common/utils/ECAAG.helper';

/**
 * Log Type
 */
export interface Log {
    /**
     * Address emitting the event
     */
    address: string;

    /**
     * Block Hash of the event
     */
    block_hash: string;

    /**
     * Block Number of the event
     */
    block_number: number;

    /**
     * Data emitted by the event
     */
    data: string;

    /**
     * Index of the event within the block
     */
    log_index: number;

    /**
     * Flag valid if event is removed
     */
    removed: boolean;

    /**
     * Topics of the event
     */
    topics: string[];

    /**
     * Transaction Hash of the event
     */
    transaction_hash: string;

    /**
     * Transaction Index within the block
     */
    transaction_index: number;

    /**
     * Identifier of the event
     */
    id: string;
}

/**
 * Transaction Entity
 */
@Entity<TxEntity>({
    table_name: 'tx',
    key: ['transaction_hash'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class TxEntity {
    /**
     * Entity Builder
     *
     * @param tx
     */
    constructor(tx?: TxEntity) {
        if (tx) {
            this.transaction_hash = tx.transaction_hash;
            this.confirmed = tx.confirmed;
            this.status = tx.status;
            this.block_hash = tx.block_hash;
            this.block_number = tx.block_number;
            this.transaction_index = tx.transaction_index;
            this.from_ = tx.from_;
            this.to_ = tx.to_;
            this.contract_address = tx.contract_address;
            this.cumulative_gas_used = tx.cumulative_gas_used;
            this.cumulative_gas_used_ln = tx.cumulative_gas_used_ln;
            this.gas_used = tx.gas_used;
            this.gas_used_ln = tx.gas_used_ln;
            this.gas_price = tx.gas_price;
            this.gas_price_ln = tx.gas_price_ln;
            this.logs = ECAAG(tx.logs).map(
                (l: Log): Log => ({
                    ...l,
                    topics: ECAAG(l.topics),
                }),
            );
            this.real_transaction_hash = tx.real_transaction_hash;
            this.logs_bloom = tx.logs_bloom;
            this.created_at = tx.created_at;
            this.updated_at = tx.updated_at;
        }
    }

    /**
     * Unique identifier of the transaction
     */
    @Column({
        type: 'text',
    })
        // tslint:disable-next-line:variable-name
    transaction_hash: string;

    /**
     * Real transaction hash of the transaction
     */
    @Column({
        type: 'text',
    })
        // tslint:disable-next-line:variable-name
    real_transaction_hash: string;

    /**
     * Flag valid if transaction is confirmed
     */
    @Column({
        type: 'boolean',
    })
    confirmed: boolean;

    /**
     * Flag valid if transaction hasn't reverted during execution
     */
    @Column({
        type: 'boolean',
    })
    status: boolean;

    /**
     * Block Hash of the transaction
     */
    @Column({
        type: 'text',
    })
        // tslint:disable-next-line:variable-name
    block_hash: string;

    /**
     * Block Number of the transaction
     */
    @Column({
        type: 'int',
    })
        // tslint:disable-next-line:variable-name
    block_number: number;

    /**
     * Transaction index of the block
     */
    @Column({
        type: 'int',
    })
        // tslint:disable-next-line:variable-name
    transaction_index: number;

    /**
     * Emitting address of the transaction
     */
    @Column({
        type: 'text',
    })
        // tslint:disable-next-line:variable-name
    from_: string;

    /**
     * Destination address of the transaction
     */
    @Column({
        type: 'text',
    })
        // tslint:disable-next-line:variable-name
    to_: string;

    /**
     * Contract address when a contract is created in a transaction
     */
    @Column({
        type: 'text',
    })
        // tslint:disable-next-line:variable-name
    contract_address: string;

    /**
     * Cumulative gas used as string
     */
    @Column({
        type: 'text',
    })
        // tslint:disable-next-line:variable-name
    cumulative_gas_used: string;

    /**
     * Cumulative gas used as ln
     */
    @Column({
        type: 'double',
    })
        // tslint:disable-next-line:variable-name
    cumulative_gas_used_ln: number;

    /**
     * Gas used as string
     */
    @Column({
        type: 'text',
    })
        // tslint:disable-next-line:variable-name
    gas_used: string;

    /**
     * Gas used as ln
     */
    @Column({
        type: 'double',
    })
        // tslint:disable-next-line:variable-name
    gas_used_ln: number;

    /**
     * Gas price as string
     */
    @Column({
        type: 'text',
    })
        // tslint:disable-next-line:variable-name
    gas_price: string;

    /**
     * Gas price as ln
     */
    @Column({
        type: 'double',
    })
        // tslint:disable-next-line:variable-name
    gas_price_ln: number;

    /**
     * Logs of the transaction
     */
    @Column({
        type: 'list',
        typeDef: '<tx_log>',
    })
        // tslint:disable-next-line:variable-name
    logs: Log[];

    /**
     * Raw logs
     */
    @Column({
        type: 'text',
    })
        // tslint:disable-next-line:variable-name
    logs_bloom: string;

    /**
     * Creation timestamp
     */
    @CreateDateColumn()
        // tslint:disable-next-line:variable-name
    created_at: Date;

    /**
     * Update timestamp
     */
    @UpdateDateColumn()
        // tslint:disable-next-line:variable-name
    updated_at: Date;
}
