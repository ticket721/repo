import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';

/**
 * Payment method from stripe
 */
interface StripePaymentMethod {
    /**
     * Type of payment method
     */
    type: string;

    /**
     * Token of payment method
     */
    stripe_token: string;
}

/**
 * Right Entity
 */
@Entity<StripeInterfaceEntity>({
    table_name: 'stripe_interface',
    key: ['id'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class StripeInterfaceEntity {
    /**
     * Entity Builder
     *
     * @param sie
     */
    constructor(sie?: StripeInterfaceEntity) {
        if (sie) {
            this.id = sie.id ? sie.id.toString() : sie.id;
            this.owner = sie.owner ? sie.owner.toString() : sie.owner;
            this.payment_methods = sie.payment_methods;
            this.connect_account = sie.connect_account;
            this.connect_account_business_type = sie.connect_account_business_type;
            this.connect_account_status = sie.connect_account_status;
            this.connect_account_updated_at = sie.connect_account_updated_at;
            this.created_at = sie.created_at;
            this.updated_at = sie.updated_at;
        }
    }

    /**
     * ID of the interface
     */
    @GeneratedUUidColumn()
    id: string;

    /**
     * ID of the owner
     */
    @Column({
        type: 'uuid',
    })
    owner: string;

    /**
     * List of available payment methods
     */
    @Column({
        type: 'list',
        typeDef: '<frozen<stripe_payment_method>>',
    })
    // tslint:disable-next-line:variable-name
    payment_methods: StripePaymentMethod[];

    /**
     * Connect account id
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    connect_account: string;

    /**
     * Connect account status
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    connect_account_status: string;

    /**
     * Connect account business type
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    connect_account_business_type: string;

    /**
     * Connect account last update
     */
    @Column({
        type: 'timestamp',
    })
    // tslint:disable-next-line:variable-name
    connect_account_updated_at: Date;

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
