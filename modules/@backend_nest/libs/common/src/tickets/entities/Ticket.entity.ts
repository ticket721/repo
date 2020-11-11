import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';

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
            this.id = t.id ? t.id.toString() : t.id;
            this.receipt = t.receipt ? t.receipt.toString() : t.receipt;
            this.owner = t.owner;
            this.category = t.category ? t.category.toString() : t.category;
            this.group_id = t.group_id;
            this.created_at = t.created_at;
            this.updated_at = t.updated_at;
        }
    }

    /**
     * Unique Category ID
     */
    @GeneratedUUidColumn()
    id: string;

    /**
     * Id of the transaction receipt
     */
    @Column({
        type: 'uuid',
    })
    receipt: string;

    /**
     * Address of current ticket owner
     */
    @Column({
        type: 'text',
    })
    owner: string;

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
