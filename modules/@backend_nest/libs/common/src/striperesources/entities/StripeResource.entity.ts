import { Column, CreateDateColumn, Entity, UpdateDateColumn } from '@iaminfinity/express-cassandra';

/**
 * Stripe Resource replay prevention
 */
@Entity<StripeResourceEntity>({
    table_name: 'striperesource',
    key: ['id'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class StripeResourceEntity {
    /**
     * Entity Builder
     *
     * @param sr
     */
    constructor(sr?: StripeResourceEntity) {
        if (sr) {
            this.id = sr.id ? sr.id.toString() : sr.id;
            this.used_by = sr.used_by ? sr.used_by.toString() : sr.used_by;
            this.created_at = sr.created_at;
            this.updated_at = sr.updated_at;
        }
    }

    /**
     * Unique id is the hash of the stripe ID
     */
    @Column({
        type: 'text',
    })
    id: string;

    /**
     * ID of user using the payment solution
     */
    @Column({
        type: 'uuid',
    })
    // tslint:disable-next-line:variable-name
    used_by: string;

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
