import {
    Column,
    CreateDateColumn,
    Entity,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';

/**
 * Data Model of a single EVM Event
 */
export interface EVMEvent {
    /**
     * Parsed return values
     */
    return_values: string;

    /**
     * Raw data
     */
    raw_data: string;

    /**
     * Raw topics
     */
    raw_topics: string[];

    /**
     * Event Name
     */
    event: string;

    /**
     * Signature of the Event
     */
    signature: string;

    /**
     * Index of the event within the transaction
     */
    log_index: number;

    /**
     * Index of the transaction within the block
     */
    transaction_index: number;

    /**
     * Hash of the transaction
     */
    transaction_hash: string;

    /**
     * Hash of the block
     */
    block_hash: string;

    /**
     * Number of the block
     */
    block_number: number;

    /**
     * Address of the emitting entity
     */
    address: string;
}

/**
 * EventSet Entity
 */
@Entity<EVMEventSetEntity>({
    table_name: 'evmeventset',
    key: ['artifact_name', 'event_name', 'block_number'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class EVMEventSetEntity {
    /**
     * Name of the emitting artifact
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    artifact_name: string;

    /**
     * Name of the Event
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    event_name: string;

    /**
     * Block Number
     */
    @Column({
        type: 'int',
    })
    // tslint:disable-next-line:variable-name
    block_number: number;

    /**
     * All events emitted for this event type at one block only
     */
    @Column({
        type: 'list',
        typeDef: '<frozen<evmevent>>',
    })
    events: EVMEvent[];

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
