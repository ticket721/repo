import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';

/**
 * Authorization modes
 */
export type AuthorizationModes = 'sealSale' | 'mint' | 'attach' | 'withdraw' | 'mintTokens';

/**
 * Authorization entity holding a signature for a user to redeem a ticket
 */
@Entity<AuthorizationEntity>({
    table_name: 'authorization',
    key: [['id'], 'granter', 'grantee', 'mode'],
    es_index_mapping: {
        discover: '.*',
        properties: {},
    },
} as any)
export class AuthorizationEntity {
    /**
     * Entity Builder
     *
     * @param a
     */
    constructor(a?: AuthorizationEntity) {
        if (a) {
            this.id = a.id ? a.id.toString() : a.id;
            this.granter = a.granter;
            this.grantee = a.grantee;
            this.mode = a.mode;
            this.codes = a.codes;
            this.selectors = a.selectors;
            this.args = a.args;
            this.signature = a.signature;
            this.readable_signature = a.readable_signature;
            this.cancelled = a.cancelled;
            this.consumed = a.consumed;
            this.dispatched = a.dispatched;
            this.user_expiration = a.user_expiration;
            this.be_expiration = a.be_expiration;
            this.created_at = a.created_at;
            this.updated_at = a.updated_at;
        }
    }

    /**
     * Unique Category ID
     */
    @GeneratedUUidColumn()
    id: string;

    /**
     * Granter address
     */
    @Column({
        type: 'text',
    })
    granter: string;

    /**
     * Grantee address
     */
    @Column({
        type: 'text',
    })
    grantee: string;

    /**
     * Authorization mode
     */
    @Column({
        type: 'text',
    })
    mode: AuthorizationModes;

    /**
     * Unique codes of the authorization
     */
    @Column({
        type: 'text',
    })
    codes: string;

    /**
     * Selector string used for queries
     */
    @Column({
        type: 'text',
    })
    selectors: string;

    /**
     * Complete flattened argument list
     */
    @Column({
        type: 'text',
    })
    args: string;

    /**
     * Hex signature
     */
    @Column({
        type: 'text',
    })
    signature: string;

    /**
     * True if signature can be seen by user
     */
    @Column({
        type: 'boolean',
    })
    // tslint:disable-next-line:variable-name
    readable_signature: boolean;

    /**
     * True if signature has been cancelled
     */
    @Column({
        type: 'boolean',
    })
    // tslint:disable-next-line:variable-name
    cancelled: boolean;

    /**
     * True if signature has been broadcasted in a transaction
     */
    @Column({
        type: 'boolean',
    })
    // tslint:disable-next-line:variable-name
    dispatched: boolean;

    /**
     * True if the signature has been properly used to mint a ticket
     */
    @Column({
        type: 'boolean',
    })
    // tslint:disable-next-line:variable-name
    consumed: boolean;

    /**
     * Date upon which the signature is shown as expired for the user
     */
    @Column({
        type: 'timestamp',
    })
    // tslint:disable-next-line:variable-name
    user_expiration: Date;

    /**
     * Date after which the authorization is considered as expired and holds no more seats
     */
    @Column({
        type: 'timestamp',
    })
    // tslint:disable-next-line:variable-name
    be_expiration: Date;

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

    getArgs(): string[] {
        return this.args.split('_').filter((value: string, index: number) => index % 2 !== 0);
    }

    getSelector(): string[] {
        return this.selectors.split('_').filter((value: string, index: number) => index % 2 !== 0);
    }

    getCodes(): string[] {
        return this.codes.split('_').filter((value: string, index: number) => index % 2 !== 0);
    }
}
