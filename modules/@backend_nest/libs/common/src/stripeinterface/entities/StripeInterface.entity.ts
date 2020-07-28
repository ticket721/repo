import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
}              from '@iaminfinity/express-cassandra';

interface StripePaymentMethod {
    card: string;
    token: string;
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
            this.id = sie.id;
            this.owner = sie.owner;
            this.payment_methods = sie.payment_methods;
            this.connect_account = sie.connect_account;
            this.connect_account_business_type = sie.connect_account_business_type;
            this.connect_account_status = sie.connect_account_status;
            this.created_at = sie.created_at;
            this.updated_at = sie.updated_at;
        }
    }

    /**
     * Grantee ID of the rights
     */
    @GeneratedUUidColumn()
        // tslint:disable-next-line:variable-name
    id: string;

    @Column({
        type: 'uuid'
    })
    owner: string;

    @Column({
        type: 'list',
        typeDef: '<stripe_payment_method>',
    })
        // tslint:disable-next-line:variable-name
    payment_methods: StripePaymentMethod[];

    @Column({
        type: 'text'
    })
        // tslint:disable-next-line:variable-name
    connect_account: string;

    @Column({
        type: 'text'
    })
        // tslint:disable-next-line:variable-name
    connect_account_status: string;

    @Column({
        type: 'text'
    })
        // tslint:disable-next-line:variable-name
    connect_account_business_type: string;

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
