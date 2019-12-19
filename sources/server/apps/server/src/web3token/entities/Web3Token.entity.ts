import {
    Entity,
    Column
} from '@iaminfinity/express-cassandra';

/**
 * Entity representing a user
 */
@Entity<Web3TokenEntity>({
    table_name: 'web3token',
    key: [['timestamp', 'address']],
    es_index_mapping: {
        discover: ".*"
    }
} as any)
export class Web3TokenEntity {
    /**
     * Timestamp used to generate auth proof
     */
    @Column({
        type: 'bigint'
    })
    timestamp: number;

    /**
     * Address used to sign
     */
    @Column({
        type: 'text'
    })
    address: string;
}
