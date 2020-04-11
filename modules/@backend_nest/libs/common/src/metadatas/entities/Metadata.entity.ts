import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';
import { Link } from '@lib/common/utils/Link.type';

/**
 * Generic metadata entity
 */
@Entity<MetadataEntity>({
    table_name: 'metadata',
    key: ['id'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class MetadataEntity {
    /**
     * Entity Builder
     *
     * @param m
     */
    constructor(m?: MetadataEntity) {
        if (m) {
            this.id = m.id ? m.id.toString() : m.id;
            this.class_name = m.class_name;
            this.type_name = m.type_name;
            this.links = m.links;
            this.writers = m.writers;
            this.public_write = m.public_write;
            this.public_read = m.public_read;
            this.readers = m.readers;
            this.bool_ = m.bool_;
            this.str_ = m.str_;
            this.int_ = m.int_;
            this.date_ = m.date_;
            this.double_ = m.double_;
            this.created_at = m.created_at;
            this.updated_at = m.updated_at;
        }
    }

    /**
     * Unique Identifier of the metadata
     */
    @GeneratedUUidColumn()
    id: string;

    /**
     * Class Name of the metadata
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    class_name: string;

    /**
     * Type Name of the metadata
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    type_name: string;

    /**
     * Links of the metadata upon other entities
     */
    @Column({
        type: 'list',
        typeDef: '<frozen<link>>',
    })
    links: Link[];

    /**
     * Writting rights on this metadata entity
     */
    @Column({
        type: 'list',
        typeDef: '<frozen<link>>',
    })
    writers: Link[];

    /**
     * True if anyone can write
     */
    @Column({
        type: 'boolean',
    })
    // tslint:disable-next-line:variable-name
    public_write: boolean;

    /**
     * Reader rights on this metadata entity
     */
    @Column({
        type: 'list',
        typeDef: '<frozen<link>>',
    })
    readers: Link[];

    /**
     * True if anyone can read
     */
    @Column({
        type: 'boolean',
    })
    // tslint:disable-next-line:variable-name
    public_read: boolean;

    /**
     * Generic boolean value storage
     */
    @Column({
        type: 'map',
        typeDef: '<text, boolean>',
    })
    // tslint:disable-next-line:variable-name
    bool_: { [key: string]: boolean };

    /**
     * Generic string value storage
     */
    @Column({
        type: 'map',
        typeDef: '<text, text>',
    })
    // tslint:disable-next-line:variable-name
    str_: { [key: string]: string };

    /**
     * Generic integer value storage
     */
    @Column({
        type: 'map',
        typeDef: '<text, int>',
    })
    // tslint:disable-next-line:variable-name
    int_: { [key: string]: number };

    /**
     * Generic date value storage
     */
    @Column({
        type: 'map',
        typeDef: '<text, timestamp>',
    })
    // tslint:disable-next-line:variable-name
    date_: { [key: string]: Date };

    /**
     * Generic double value storage
     */
    @Column({
        type: 'map',
        typeDef: '<text, double>',
    })
    // tslint:disable-next-line:variable-name
    double_: { [key: string]: number };

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
