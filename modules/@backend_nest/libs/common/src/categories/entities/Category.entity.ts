import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';
import { ECAAG } from '@lib/common/utils/ECAAG.helper';

/**
 * Error interface whem checking for selection validity
 */
export interface CategorySelectionError {
    /**
     * Category affected by error
     */
    category: CategoryEntity;

    /**
     * Error reason
     */
    reason: string;
}

/**
 * Category Entity
 */
@Entity<CategoryEntity>({
    table_name: 'category',
    key: ['id'],
    es_index_mapping: {
        discover: '.*',
        properties: {},
    },
} as any)
export class CategoryEntity {
    /**
     * Category Constructor
     *
     * @param c
     */
    constructor(c?: CategoryEntity) {
        if (c) {
            this.id = c.id ? c.id.toString() : c.id;
            this.group_id = c.group_id;
            this.category_name = c.category_name;
            this.display_name = c.display_name;
            this.sale_begin = c.sale_begin;
            this.sale_end = c.sale_end;
            this.price = c.price;
            this.currency = c.currency;
            this.interface = c.interface;
            this.seats = c.seats;
            this.dates = ECAAG(c.dates);
            this.status = c.status;
            this.created_at = c.created_at;
            this.updated_at = c.updated_at;
        }
    }

    /**
     * Unique Category ID
     */
    @GeneratedUUidColumn()
    id: string;

    /**
     * Group ID of the category
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    group_id: string;

    /**
     * Category visibility status
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    status: 'preview' | 'live';

    /**
     * Category Name
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    category_name: string;

    /**
     * Display Name of the Category
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    display_name: string;

    /**
     * Sale Begin date
     */
    @Column({
        type: 'timestamp',
    })
    // tslint:disable-next-line:variable-name
    sale_begin: Date;

    /**
     * Sale End date
     */
    @Column({
        type: 'timestamp',
    })
    // tslint:disable-next-line:variable-name
    sale_end: Date;

    /**
     * Price of the category
     */
    @Column({
        type: 'int',
    })
    price: number;

    /**
     * Price of the category
     */
    @Column({
        type: 'text',
    })
    currency: string;

    /**
     * Payment interface of the category
     */
    @Column({
        type: 'text',
    })
    interface: 'stripe' | 'none';

    /**
     * Available seats of the category
     */
    @Column({
        type: 'int',
    })
    seats: number;

    /**
     * Dates where this ticket gives access
     */
    @Column({
        type: 'list',
        typeDef: '<uuid>',
    })
    dates: string[];

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
