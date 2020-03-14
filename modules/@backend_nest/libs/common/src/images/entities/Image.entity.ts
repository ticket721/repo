import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';

/**
 * Image Entity
 */
@Entity<ImageEntity>({
    table_name: 'image',
    key: ['id'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class ImageEntity {
    /**
     * Unique identifier of the image. Also used on the path to recover the image
     */
    @GeneratedUUidColumn()
    id: string;

    /**
     * Image mimetype
     */
    @Column({
        type: 'text',
    })
    mimetype: string;

    /**
     * Image size in bytes
     */
    @Column({
        type: 'int',
    })
    size: number;

    /**
     * Image encoding
     */
    @Column({
        type: 'text',
    })
    encoding: string;

    /**
     * Image hash
     */
    @Column({
        type: 'text',
    })
    hash: string;

    /**
     * Image links count
     */
    @Column({
        type: 'int',
    })
    links: number;

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
