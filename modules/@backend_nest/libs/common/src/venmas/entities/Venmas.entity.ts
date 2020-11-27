import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';

export interface Point {
    x: number;
    y: number;
}

export interface Sections {
    id: string;
    type: string;
    name: string;
    description: string;
    points: Point[];
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
                        cql_collection: 'singleton',
                    },
                    type: {
                        type: 'text',
                        cql_collection: 'singleton',
                    },
                    owner: {
                        type: 'text',
                        cql_collection: 'singleton',
                    },
                    points: {
                        cql_collection: 'list',
                        type: 'nested',
                        properties: {
                            x: {
                                cql_collection: 'singleton',
                                type: 'float',
                            },
                            y: {
                                cql_collection: 'singleton',
                                type: 'float',
                            },
                        },
                    },
                },
            },
        },
    },
} as any)
export class VenmasEntity {
    /**
     * Entity Builder
     *
     * @param v
     */
    constructor(v?: VenmasEntity) {
        if (v) {
            this.id = v.id ? v.id.toString() : v.id;
            this.name = v.name;
            this.owner = v.owner ? v.owner.toString() : v.owner;
            this.map = v.map;
            this.sections = v.sections;
            this.created_at = v.created_at;
            this.updated_at = v.updated_at;
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
        type: 'list',
        typeDef: '<frozen<ticket721.venmas_section>>',
    })
    // tslint:disable-next-line:variable-name
    sections: Sections[];

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
