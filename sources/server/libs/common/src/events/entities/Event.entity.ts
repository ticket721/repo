import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
}                      from '@iaminfinity/express-cassandra';
import { Category }    from '@lib/common/dates/entities/Date.entity';

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
     * Unique ID of the Date
     */
    @GeneratedUUidColumn()
    id: string;

    /**
     * Unique ID of the Dates
     */
    @Column({
        type: 'list',
        typeDef: '<uuid>',
    })
    dates: string[];

    /**
     * Name of the event
     */
    @Column({
        type: 'text',
    })
    name: string;

    /**
     * Description of the event
     */
    @Column({
        type: 'text',
    })
    description: string;

    /**
     * Avatar image of the event
     */
    @Column({
        type: 'text',
    })
    avatar: string;

    /**
     * Banner images of the event
     */
    @Column({
        type: 'list',
        typeDef: '<text>',
    })
    banners: string[];

    /**
     * Ticket categories that are cross-dates
     */
    @Column({
        type: 'list',
        typeDef: '<frozen<category>>',
    })
    categories: Category[];

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
