import { Column, CreateDateColumn, Entity, UpdateDateColumn } from '@iaminfinity/express-cassandra';

@Entity<TicketEntity>({
    table_name: 'ticket',
    key: ['id'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class TicketEntity {
    /**
     * Entity Builder
     *
     * @param t
     */
    constructor(t?: TicketEntity) {
        if (t) {
            this.id = t.id;
            this.authorization = t.authorization;
            this.owner = t.owner;
            this.env = t.env;
            this.status = t.status;
            this.transaction_hash = t.transaction_hash;
            this.category = t.category ? t.category.toString() : t.category;
            this.group_id = t.group_id;
            this.parent_id = t.parent_id ? t.parent_id.toString() : t.parent_id;
            this.parent_type = t.parent_type;
            this.created_at = t.created_at;
            this.updated_at = t.updated_at;
        }
    }

    /**
     * Unique id is hex value of the unique on chain id
     */
    @Column({
        type: 'text',
    })
    id: string;

    @Column({
        type: 'uuid',
    })
    authorization: string;

    @Column({
        type: 'text'
    })
    owner: string;

    @Column({
        type: 'text'
    })
    env: 'chain' | 'db';

    @Column({
        type: 'text'
    })
    status: 'minting' | 'ready' | 'canceled';

    @Column({
        type: 'text'
    })
        // tslint:disable-next-line:variable-name
    transaction_hash: string;

    @Column({
        type: 'uuid'
    })
    category: string;

    @Column({
        type: 'text'
    })
        // tslint:disable-next-line:variable-name
    group_id: string;

    @Column({
        type: 'uuid'
    })
        // tslint:disable-next-line:variable-name
    parent_id: string;

    @Column({
        type: 'text'
    })
        // tslint:disable-next-line:variable-name
    parent_type: string;

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
