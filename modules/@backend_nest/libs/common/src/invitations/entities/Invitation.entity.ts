import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';
import { ECAAG } from '@lib/common/utils/ECAAG.helper';

/**
 * Invitation Entity
 */
@Entity<InvitationEntity>({
    table_name: 'invitation',
    key: ['id'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class InvitationEntity {
    /**
     * Entity Builder
     *
     * @param t
     */
    constructor(t?: InvitationEntity) {
        if (t) {
            this.id = t.id ? t.id.toString() : t.id;
            this.owner = t.owner;
            this.dates = ECAAG(t.dates);
            this.group_id = t.group_id;
            this.created_at = t.created_at;
            this.updated_at = t.updated_at;
        }
    }

    /**
     * Unique Category ID
     */
    @GeneratedUUidColumn()
    id: string;

    /**
     * Address of current ticket owner
     */
    @Column({
        type: 'text',
    })
    owner: string;

    /**
     * date access
     */
    @Column({
        type: 'list',
        typeDef: '<uuid>',
    })
    dates: string[];

    /**
     * Group ID
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
