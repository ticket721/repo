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

interface ConnectAccountError {
    code: number;
    reason: string;
    requirement: string;
}

interface ConnectAccountExternalAccount {
    id: string;
    country: string;
    currency: string;
    last4: string;
    name: string;
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
            this.connect_account_current_deadline = sie.connect_account_current_deadline;
            this.connect_account_currently_due = sie.connect_account_currently_due;
            this.connect_account_eventually_due = sie.connect_account_eventually_due;
            this.connect_account_past_due = sie.connect_account_past_due;
            this.connect_account_pending_verification = sie.connect_account_pending_verification;
            this.connect_account_errors = sie.connect_account_errors;
            this.connect_account_external_accounts = sie.connect_account_external_accounts;
            this.connect_account_name = sie.connect_account_name;
            this.connect_account_type = sie.connect_account_type;
            this.connect_account_disabled_reason = sie.connect_account_disabled_reason;
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

    @Column({
        type: 'timestamp',
    })
        // tslint:disable-next-line:variable-name
    connect_account_current_deadline: Date;

    @Column({
        type: 'list',
        typeDef: '<text>'
    })
        // tslint:disable-next-line:variable-name
    connect_account_currently_due: string[];

    @Column({
        type: 'list',
        typeDef: '<text>'
    })
        // tslint:disable-next-line:variable-name
    connect_account_eventually_due: string[];

    @Column({
        type: 'list',
        typeDef: '<text>'
    })
        // tslint:disable-next-line:variable-name
    connect_account_past_due: string[];

    @Column({
        type: 'list',
        typeDef: '<text>'
    })
        // tslint:disable-next-line:variable-name
    connect_account_pending_verification: string[];

    @Column({
        type: 'list',
        typeDef: '<frozen<connect_account_error>>'
    })
        // tslint:disable-next-line:variable-name
    connect_account_errors: ConnectAccountError[];

    @Column({
        type: 'list',
        typeDef: '<frozen<connect_account_external_account>>'
    })
        // tslint:disable-next-line:variable-name
    connect_account_external_accounts: ConnectAccountExternalAccount[];

    @Column({
        type: 'text'
    })
        // tslint:disable-next-line:variable-name
    connect_account_name: string;

    @Column({
        type: 'text'
    })
        // tslint:disable-next-line:variable-name
    connect_account_type: string;

    @Column({
        type: 'text'
    })
        // tslint:disable-next-line:variable-name
    connect_account_disabled_reason: string;

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
