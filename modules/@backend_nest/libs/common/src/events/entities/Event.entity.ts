import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';
import { ECAAG } from '@lib/common/utils/ECAAG.helper';

/**
 * A Date is linked to a location and a point in time, and has linked ticket categories
 */
@Entity<EventEntity>({
    table_name: 'event',
    key: ['id'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class EventEntity {
    /**
     * Entity Builder
     *
     * @param e
     */
    constructor(e?: EventEntity) {
        if (e) {
            this.id = e.id ? e.id.toString() : e.id;
            this.group_id = e.group_id;
            this.name = e.name;
            this.address = e.address;
            this.controller = e.controller;
            this.dates = ECAAG<string>(e.dates);
            this.categories = ECAAG<string>(e.categories);
            this.created_at = e.created_at;
            this.updated_at = e.updated_at;
        }
    }

    /**
     * Unique ID of the Date
     */
    @GeneratedUUidColumn()
    id: string;

    /**
     * Name of the Date
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    group_id: string;

    /**
     * Name of the Date
     */
    @Column({
        type: 'text',
    })
    name: string;

    /**
     * Validating address
     */
    @Column({
        type: 'text',
    })
    address: string;

    /**
     * Event Wallet Controller
     */
    @Column({
        type: 'text',
    })
    controller: string;

    /**
     * Unique ID of the Dates
     */
    @Column({
        type: 'list',
        typeDef: '<uuid>',
    })
    dates: string[];

    /**
     * Ticket categories that are cross-dates
     */
    @Column({
        type: 'list',
        typeDef: '<uuid>',
    })
    categories: string[];

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
