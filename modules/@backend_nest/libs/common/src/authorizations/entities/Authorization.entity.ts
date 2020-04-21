import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';
import { Link } from '@lib/common/utils/Link.type';

export type AuthorizationModes = 'sealSale' | 'mint' | 'attach' | 'withdraw';

@Entity<AuthorizationEntity>({
    table_name: 'authorization',
    key: [['id'], 'granter', 'grantee', 'mode'],
    es_index_mapping: {
        discover: '.*',
        properties: {},
    },
} as any)
export class AuthorizationEntity {
    constructor(a?: AuthorizationEntity) {
        if (a) {
            this.id = a.id ? a.id.toString() : a.id;
            this.granter = a.granter;
            this.grantee = a.grantee;
            this.links = a.links;
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

    @Column({
        type: 'text',
    })
    granter: string;

    @Column({
        type: 'text',
    })
    grantee: string;

    @Column({
        type: 'text',
    })
    mode: AuthorizationModes;

    @Column({
        type: 'list',
        typeDef: '<frozen<link>>',
    })
    links: Link[];

    @Column({
        type: 'text',
    })
    codes: string;

    @Column({
        type: 'text',
    })
    selectors: string;

    @Column({
        type: 'text',
    })
    args: string;

    @Column({
        type: 'text',
    })
    signature: string;

    @Column({
        type: 'boolean',
    })
    // tslint:disable-next-line:variable-name
    readable_signature: boolean;

    @Column({
        type: 'boolean',
    })
    // tslint:disable-next-line:variable-name
    cancelled: boolean;

    @Column({
        type: 'boolean',
    })
    // tslint:disable-next-line:variable-name
    dispatched: boolean;

    @Column({
        type: 'boolean',
    })
    // tslint:disable-next-line:variable-name
    consumed: boolean;

    @Column({
        type: 'timestamp',
    })
    // tslint:disable-next-line:variable-name
    user_expiration: Date;

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
}
