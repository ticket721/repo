import {
    Column,
    CreateDateColumn,
    Entity,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';

export interface Log {
    address: string;
    block_hash: string;
    block_number: number;
    data: string;
    log_index: number;
    removed: boolean;
    topics: string[];
    transaction_hash: string;
    transaction_index: number;
    id: string;
}

@Entity<TxEntity>({
    table_name: 'tx',
    key: ['transaction_hash'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class TxEntity {
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    transaction_hash: string;

    @Column({
        type: 'boolean',
    })
    confirmed: boolean;

    @Column({
        type: 'boolean',
    })
    status: boolean;

    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    block_hash: string;

    @Column({
        type: 'int',
    })
    // tslint:disable-next-line:variable-name
    block_number: number;

    @Column({
        type: 'int',
    })
    // tslint:disable-next-line:variable-name
    transaction_index: number;

    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    from_: string;

    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    to_: string;

    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    contract_address: string;

    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    cumulative_gas_used: string;

    @Column({
        type: 'double',
    })
    // tslint:disable-next-line:variable-name
    cumulative_gas_used_ln: number;

    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    gas_used: string;

    @Column({
        type: 'double',
    })
    // tslint:disable-next-line:variable-name
    gas_used_ln: number;

    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    gas_price: string;

    @Column({
        type: 'double',
    })
    // tslint:disable-next-line:variable-name
    gas_price_ln: number;

    @Column({
        type: 'list',
        typeDef: '<tx_log>',
    })
    // tslint:disable-next-line:variable-name
    logs: Log[];

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
