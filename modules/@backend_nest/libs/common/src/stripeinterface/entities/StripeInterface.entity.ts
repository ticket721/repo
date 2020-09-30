import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';
import { ECAAG } from '@lib/common/utils/ECAAG.helper';

/**
 * Payment method from stripe
 */
export interface StripePaymentMethod {
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
 * Error linked to the Connect Account status
 */
export interface ConnectAccountError {
    /**
     * Error code
     */
    code: string;

    /**
     * Detailed description and reason
     */
    reason: string;

    /**
     * Requirement linked to the error
     */
    requirement: string;
}

/**
 * External Account linked to the Stripe Account
 */
export interface ConnectAccountExternalAccount {
    /**
     * ID of the External Account
     */
    id: string;

    /**
     * Unique fingerprint of the External Account
     */
    fingerprint: string;

    /**
     * Country of the External Account
     */
    country: string;

    /**
     * Main currency of the External Account
     */
    currency: string;

    /**
     * Last 4 digits used to identify the account
     */
    last4: string;

    /**
     * Name of the External Account
     */
    name: string;

    /**
     * Status of the External Account
     */
    status: 'new' | 'validated' | 'verified' | 'verification_failed' | 'errored';

    /**
     * True if account is default recipient when withdrawing in same currency
     */
    default_for_currency: boolean;
}

/**
 * Connect Account capability and status
 */
export interface ConnectAccountCapability {
    /**
     * Name of the capability
     */
    name: string;

    /**
     * Status of the caoability
     */
    status: string;
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
            this.payment_methods = ECAAG(sie.payment_methods);
            this.connect_account = sie.connect_account;
            this.connect_account_capabilities = ECAAG(sie.connect_account_capabilities);
            this.connect_account_current_deadline = sie.connect_account_current_deadline;
            this.connect_account_currently_due = ECAAG(sie.connect_account_currently_due);
            this.connect_account_eventually_due = ECAAG(sie.connect_account_eventually_due);
            this.connect_account_past_due = ECAAG(sie.connect_account_past_due);
            this.connect_account_pending_verification = ECAAG(sie.connect_account_pending_verification);
            this.connect_account_errors = ECAAG(sie.connect_account_errors);
            this.connect_account_external_accounts = ECAAG(sie.connect_account_external_accounts);
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

    /**
     * List of account capabilities and statuses
     */
    @Column({
        type: 'list',
        typeDef: '<frozen<connect_account_capability>>',
    })
    // tslint:disable-next-line:variable-name
    connect_account_capabilities: ConnectAccountCapability[];

    /**
     * Date of requirement deadline
     */
    @Column({
        type: 'timestamp',
    })
    // tslint:disable-next-line:variable-name
    connect_account_current_deadline: Date;

    /**
     * Currently due requirements
     */
    @Column({
        type: 'list',
        typeDef: '<text>',
    })
    // tslint:disable-next-line:variable-name
    connect_account_currently_due: string[];

    /**
     * Eventually due requirements
     */
    @Column({
        type: 'list',
        typeDef: '<text>',
    })
    // tslint:disable-next-line:variable-name
    connect_account_eventually_due: string[];

    /**
     * Past due requirements
     */
    @Column({
        type: 'list',
        typeDef: '<text>',
    })
    // tslint:disable-next-line:variable-name
    connect_account_past_due: string[];

    /**
     * Pending document verifications
     */
    @Column({
        type: 'list',
        typeDef: '<text>',
    })
    // tslint:disable-next-line:variable-name
    connect_account_pending_verification: string[];

    /**
     * Errors on the account
     */
    @Column({
        type: 'list',
        typeDef: '<frozen<connect_account_error>>',
    })
    // tslint:disable-next-line:variable-name
    connect_account_errors: ConnectAccountError[];

    /**
     * External accounts used for withdraws
     */
    @Column({
        type: 'list',
        typeDef: '<frozen<connect_account_external_account>>',
    })
    // tslint:disable-next-line:variable-name
    connect_account_external_accounts: ConnectAccountExternalAccount[];

    /**
     * Display name of the account
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    connect_account_name: string;

    /**
     * Account type
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    connect_account_type: string;

    /**
     * Disabled reason. Empty if nothing disabling
     */
    @Column({
        type: 'text',
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
