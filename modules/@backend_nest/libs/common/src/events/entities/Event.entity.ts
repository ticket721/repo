import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';
import { Category } from '@lib/common/dates/entities/Date.entity';

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
     * Status of the event
     */
    @Column({
        type: 'text',
    })
    status: 'preview' | 'live';

    /**
     * Validating address
     */
    @Column({
        type: 'text',
    })
    address: string;

    /**
     * Unique ID of the Owner
     */
    @Column({
        type: 'uuid',
    })
    owner: string;

    /**
     * Unique ID of the Admins
     */
    @Column({
        type: 'list',
        typeDef: '<uuid>',
    })
    admins: string[];

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
        typeDef: '<frozen<category>>',
    })
    categories: Category[];

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
        type: 'uuid',
    })
    avatar: string;

    /**
     * Banner images of the event
     */
    @Column({
        type: 'list',
        typeDef: '<uuid>',
    })
    banners: string[];

    /**
     * Description of the event
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    group_id: string;

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
