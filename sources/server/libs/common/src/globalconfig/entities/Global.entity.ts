import {
    Column,
    CreateDateColumn,
    Entity,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';

@Entity<GlobalEntity>({
    table_name: 'global',
    key: ['id'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class GlobalEntity {
    @Column({
        type: 'text',
    })
    id: string;

    @Column({
        type: 'int',
    })
    // tslint:disable-next-line:variable-name
    block_number: number;

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
