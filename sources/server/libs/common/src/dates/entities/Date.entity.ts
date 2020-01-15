import { Coordinates } from '@ticket721sources/global';
import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';

/**
 * Price of the Category
 */
export interface Price {
    /**
     * Currency of the price
     */
    currency: string;

    /**
     * Value as a string decimal 10
     */
    value: string;

    /**
     * Value as a log
     */
    log_value: number;
}

/**
 * Ticket Category linked to Date
 */
export interface Category {
    /**
     * Linked group id
     */
    group_id: string;

    /**
     * Name of the category
     */
    category_name: string;

    /**
     * Index of the category in the group
     */
    category_index: number;

    /**
     * Ticket scope
     */
    scope: string;

    /**
     * Prices of the category
     */
    prices: Price[];
}

/**
 * Metadata of the date
 */
export interface DateMetadata {
    /**
     * Name to display along the date
     */
    name: string;

    /**
     * Image to use with this date
     */
    image: string;
}

/**
 * A Date is linked to a location and a point in time, and has linked ticket categories
 */
@Entity<DateEntity>({
    table_name: 'date',
    key: ['id'],
    es_index_mapping: {
        discover: '^((?!location).*)',
        properties: {
            location: {
                type: 'geo_point',
                cql_collection: 'singleton',
            },
        },
    },
} as any)
export class DateEntity {
    /**
     * Unique ID of the Date
     */
    @GeneratedUUidColumn()
    id: string;

    /**
     * Location label of the date
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    location_label: string;

    /**
     * Coordinates of the Date
     */
    @Column({
        type: 'frozen',
        typeDef: '<geo_point>',
    })
    location: Coordinates;

    /**
     * Assigned city of the Date
     */
    @Column({
        type: 'int',
    })
    // tslint:disable-next-line:variable-name
    assigned_city: number;

    /**
     * Ticket categories of the Date
     */
    @Column({
        type: 'list',
        typeDef: '<frozen<category>>',
    })
    categories: Category[];

    /**
     * Metadata to use with the Date
     */
    @Column({
        type: 'frozen',
        typeDef: '<date_metadata>',
    })
    metadata: DateMetadata;

    /**
     * Id of parent entity
     */
    @Column({
        type: 'uuid',
    })
    // tslint:disable-next-line:variable-name
    parent_id: string;

    /**
     * Type of parent entity
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    parent_type: string;

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
