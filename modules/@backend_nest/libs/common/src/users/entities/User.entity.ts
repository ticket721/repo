import { Entity, Column, GeneratedUUidColumn } from '@iaminfinity/express-cassandra';
import { Purchase } from '@lib/common/users/entities/Purchases.type';

/**
 * Entity representing a user
 */
@Entity<UserEntity>({
    table_name: 'user',
    key: ['id'],
    es_index_mapping: {
        discover: '.*',
        properties: {
            password: {
                type: 'keyword',
                index: false,
            },
        },
    },
} as any)
export class UserEntity {
    /**
     * Unique identifier
     */
    @GeneratedUUidColumn()
    id: string;

    @Column({
        type: 'frozen',
        typeDef: '<purchase>',
    })
    // tslint:disable-next-line:variable-name
    current_purchase: Purchase;

    @Column({
        type: 'list',
        typeDef: '<frozen<purchase>>',
    })
    // tslint:disable-next-line:variable-name
    past_purchases: Purchase[];

    /**
     * Unique email
     */
    @Column({
        type: 'text',
    })
    email: string;

    /**
     * Unique username
     */
    @Column({
        type: 'text',
    })
    username: string;

    /**
     * Keccak256 hash of the pure password
     */
    @Column({
        type: 'text',
    })
    password: string;

    /**
     * Account type
     */
    @Column({
        type: 'text',
    })
    type: 't721' | 'web3';

    /**
     * Account address
     */
    @Column({
        type: 'text',
    })
    address: string;

    /**
     * Device address
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    device_address: string;

    /**
     * Account role
     */
    @Column({
        type: 'text',
    })
    role: 'authenticated' | 'admin';

    /**
     * True if email was validated
     */
    @Column({
        type: 'boolean',
    })
    valid: boolean;

    /**
     * True if user is admin
     */
    @Column({
        type: 'boolean',
    })
    admin: boolean;

    /**
     * User Locale
     */
    @Column({
        type: 'text',
    })
    locale: string;
}
