import { Entity, Column, GeneratedUUidColumn } from '@iaminfinity/express-cassandra';

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
     * User Locale
     */
    @Column({
        type: 'text',
    })
    locale: string;
}
