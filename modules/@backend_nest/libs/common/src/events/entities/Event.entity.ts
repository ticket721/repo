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
            this.stripe_interface = e.stripe_interface ? e.stripe_interface.toString() : e.stripe_interface;
            this.custom_percent_fee = e.custom_percent_fee;
            this.custom_static_fee = e.custom_static_fee;
            this.signature_colors = ECAAG(e.signature_colors) as [string, string];
            this.owner = e.owner ? e.owner.toString() : e.owner;
            this.avatar = e.avatar;
            this.name = e.name;
            this.description = e.description;
            this.address = e.address;
            this.controller = e.controller;
            this.status = e.status;
            this.dates = ECAAG<string>(e.dates);
            this.created_at = e.created_at;
            this.updated_at = e.updated_at;
        }
    }

    /**
     * Unique ID of the Date
     */
    @GeneratedUUidColumn()
    id: string;

    @Column({
        type: 'int',
    })
    // tslint:disable-next-line:variable-name
    custom_static_fee: number;

    @Column({
        type: 'double',
    })
    // tslint:disable-next-line:variable-name
    custom_percent_fee: number;

    /**
     * ID of the owner
     */
    @Column({
        type: 'uuid',
    })
    // tslint:disable-next-line:variable-name
    owner: string;

    /**
     * ID of the stripe interface to use in case of stripe payments
     */
    @Column({
        type: 'uuid',
    })
    // tslint:disable-next-line:variable-name
    stripe_interface: string;

    /**
     * Category visibility status
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    status: 'preview' | 'live';

    /**
     * Image of the event
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    avatar: string;

    /**
     * Signature colors
     */
    @Column({
        type: 'list',
        typeDef: '<text>',
    })
    // tslint:disable-next-line:variable-name
    signature_colors: [string, string];

    /**
     * Description of the event
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    description: string;

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
