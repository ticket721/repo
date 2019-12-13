import {
    Entity,
    Column,
    GeneratedUUidColumn,
} from '@iaminfinity/express-cassandra';

@Entity<UserEntity>({
    table_name: 'user',
    key: ['id'],
    es_index_mapping: {
        discover: "^((?!password|wallet).*)"
    }
} as any)
export class UserEntity {
    @GeneratedUUidColumn()
    id: string;

    @Column({
        type: 'text'
    })
    email: string;

    @Column({
        type: 'text'
    })
    username: string;

    @Column({
        type: 'text'
    })
    password: string;

    @Column({
        type: 'text'
    })
    type: string;

    @Column({
        type: 'text'
    })
    wallet: string;

    @Column({
        type: 'text'
    })
    address: string;
}
