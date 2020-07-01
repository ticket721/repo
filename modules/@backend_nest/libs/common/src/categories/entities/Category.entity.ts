import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';
import { ECAAG } from '@lib/common/utils/ECAAG.helper';
import { Price } from '@lib/common/currencies/Currencies.service';

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
            this.resale_begin = c.resale_begin;
            this.resale_end = c.resale_end;
            this.scope = c.scope;
            this.prices = ECAAG(c.prices);
            this.seats = c.seats;
            this.reserved = c.reserved;
            this.parent_id = c.parent_id ? c.parent_id.toString() : c.parent_id;
            this.parent_type = c.parent_type;
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
     * Resale Begin date
     */
    @Column({
        type: 'timestamp',
    })
    // tslint:disable-next-line:variable-name
    resale_begin: Date;

    /**
     * Resale End date
     */
    @Column({
        type: 'timestamp',
    })
    // tslint:disable-next-line:variable-name
    resale_end: Date;

    /**
     * Ticket scope of the category
     */
    @Column({
        type: 'text',
    })
    scope: string;

    /**
     * Prices of the category
     */
    @Column({
        type: 'list',
        typeDef: '<frozen<price>>',
    })
    prices: Price[];

    /**
     * Available seats of the category
     */
    @Column({
        type: 'int',
    })
    seats: number;

    /**
     * Current amount of existing tickets
     */
    @Column({
        type: 'int',
    })
    reserved: number;

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

    /**
     * Utility to check if a purchase can happen
     *
     * @param now
     * @param cat
     */
    static checkCategoryErrors(now: Date, cat: CategoryEntity): CategorySelectionError[] {
        const errors: CategorySelectionError[] = [];

        if (now.getTime() > new Date(cat.sale_end).getTime()) {
            errors.push({
                category: cat,
                reason: 'sale_ended',
            });
        }

        if (now.getTime() < new Date(cat.sale_begin).getTime()) {
            errors.push({
                category: cat,
                reason: 'sale_not_started',
            });
        }

        if (cat.parent_type === null) {
            errors.push({
                category: cat,
                reason: 'category_not_available',
            });
        }

        return errors;
    }
}
