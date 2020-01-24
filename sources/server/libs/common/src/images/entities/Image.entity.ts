import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';

@Entity<ImageEntity>({
    table_name: 'image',
    key: ['id'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class ImageEntity {
    @GeneratedUUidColumn()
    id: string;

    @Column({
        type: 'text',
    })
    mimetype: string;

    @Column({
        type: 'int',
    })
    size: number;

    @Column({
        type: 'text',
    })
    encoding: string;

    @Column({
        type: 'text',
    })
    hash: string;

    @Column({
        type: 'int',
    })
    links: number;

    @CreateDateColumn()
    // tslint:disable-next-line:variable-name
    created_at: Date;

    @UpdateDateColumn()
    // tslint:disable-next-line:variable-name
    updated_at: Date;
}
