import { Column, CreateDateColumn, Entity, UpdateDateColumn } from '@iaminfinity/express-cassandra';

/**
 * Global Configuration entity. Used to synchronize dynamic data accross all nodes
 */
@Entity<GlobalEntity>({
    table_name: 'global',
    key: ['id'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class GlobalEntity {
    /**
     * Entity Builder
     *
     * @param ge
     */
    constructor(ge?: GlobalEntity) {
        if (ge) {
            this.id = ge.id;
            this.block_number = ge.block_number;
            this.processed_block_number = ge.processed_block_number;
            this.eth_eur_price = ge.eth_eur_price;
            this.created_at = ge.created_at;
            this.updated_at = ge.updated_at;
        }
    }

    /**
     * Unique identifier of the global config (always 'global')
     */
    @Column({
        type: 'text',
    })
    id: 'global';

    /**
     * Current Block Number
     */
    @Column({
        type: 'int',
    })
    // tslint:disable-next-line:variable-name
    block_number: number;

    /**
     * Last processed block number
     */
    @Column({
        type: 'int',
    })
    // tslint:disable-next-line:variable-name
    processed_block_number: number;

    /**
     * Current Ether Price in Euro
     */
    @Column({
        type: 'int',
    })
    // tslint:disable-next-line:variable-name
    eth_eur_price: number;

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
