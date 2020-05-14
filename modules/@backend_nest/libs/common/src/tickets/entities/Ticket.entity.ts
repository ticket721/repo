import { Column, CreateDateColumn, Entity, UpdateDateColumn } from '@iaminfinity/express-cassandra';

/**
 * Ticket Entity
 */
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
            this.authorization = t.authorization ? t.authorization.toString() : t.authorization;
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

    /**
     * Authorization ID given to produce this ticket
     */
    @Column({
        type: 'uuid',
    })
    authorization: string;

    /**
     * Address of current ticket owner
     */
    @Column({
        type: 'text',
    })
    owner: string;

    /**
     * Env type of the ticket
     */
    @Column({
        type: 'text',
    })
    env: 'chain' | 'db';

    /**
     * Status of the ticket
     */
    @Column({
        type: 'text',
    })
    status: 'minting' | 'ready' | 'canceled';

    /**
     * Transaction hash where the ticket has been created
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    transaction_hash: string;

    /**
     * Category ID
     */
    @Column({
        type: 'uuid',
    })
    category: string;

    /**
     * Group ID
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    group_id: string;

    /**
     * ID of parent entity
     */
    @Column({
        type: 'uuid',
    })
    // tslint:disable-next-line:variable-name
    parent_id: string;

    /**
     * Type of parent entity
     */
    @Column({
        type: 'text',
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
