import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
}                 from '@iaminfinity/express-cassandra';

export interface Sections {
    id: string;
    type: string;
    name: string;
    description: string;
    points: [[number, number]];
}

/**
 * Venmas Entity
 */
@Entity<VenmasEntity>({
    table_name: 'venmas',
    key: ['id'],
    es_index_mapping: {
        discover: '^((?!(sections)).*)',
        properties: {
            sections: {
                type: 'nested',
                cql_collection: 'list',
                properties: {
                    id: {
                        type: 'integer',
                        cql_collection: 'singleton'
                    },
                    type: {
                        type: 'text',
                        cql_collection: 'singleton'
                    },
                    owner: {
                        type: 'text',
                        cql_collection: 'singleton'
                    },
                    points: {
                        type: 'float',
                        cql_collection: 'set'
                    }
                }
            }
        }
    },
} as any)
export class VenmasEntity {
    /**
     * Entity Builder
     *
     * @param r
     */
    constructor(r?: VenmasEntity) {
        if (r) {
            this.id = r.id;
            this.name = r.name;
            this.owner = r.owner;
            this.map = r.map;
            this.sections = r.sections;
            this.created_at = r.created_at;
            this.updated_at = r.updated_at;
        }
    }

    /**
     * Unique ID of Venmas Entity
     */
    @GeneratedUUidColumn()
        // tslint:disable-next-line:variable-name
    id: string;

    /**
     * Venmas entity name
     */
    @Column({
        type: 'text',
    })
        // tslint:disable-next-line:variable-name
    name: string;

    /**
     * Venmas entity owner ID
     */
    @Column({
        type: 'text',
    })
        // tslint:disable-next-line:variable-name
    owner: string;

    /**
     * Venmas entity map (Base64 image)
     */
    @Column({
        type: 'text',
    })
        // tslint:disable-next-line:variable-name
    map: string;

    /**
     * Venmas entity sections
     */
    @Column({
        type: 'text',
    })
        // tslint:disable-next-line:variable-name
    sections: Sections;

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
