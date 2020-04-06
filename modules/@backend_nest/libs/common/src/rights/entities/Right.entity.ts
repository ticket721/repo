import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';

/**
 * Right Entity
 */
@Entity<RightEntity>({
    table_name: 'right',
    key: [['grantee_id'], 'entity_type', 'entity_value'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class RightEntity {
    /**
     * Entity Builder
     *
     * @param r
     */
    constructor(r?: RightEntity) {
        if (r) {
            this.grantee_id = r.grantee_id ? r.grantee_id.toString() : r.grantee_id;
            this.entity_type = r.entity_type;
            this.entity_value = r.entity_value;
            this.rights = r.rights;
            this.created_at = r.created_at;
            this.updated_at = r.updated_at;
        }
    }

    /**
     * Grantee ID of the rights
     */
    @GeneratedUUidColumn()
    // tslint:disable-next-line:variable-name
    grantee_id: string;

    /**
     * Entity type on which the grantee has rights
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    entity_type: string;

    /**
     * Entity selector
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    entity_value: string;

    /**
     * Rights map
     */
    @Column({
        type: 'map',
        typeDef: '<text,boolean>',
    })
    rights: { [key: string]: boolean };

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
