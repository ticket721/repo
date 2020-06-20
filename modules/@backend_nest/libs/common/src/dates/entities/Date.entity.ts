import {
    Column,
    CreateDateColumn,
    Entity,
    GeneratedUUidColumn,
    UpdateDateColumn,
} from '@iaminfinity/express-cassandra';
import { ECAAG } from '@lib/common/utils/ECAAG.helper';
import {
    ArrayMinSize,
    IsDateString,
    IsHexColor,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Metadata of the date
 */
export class DateMetadata {
    /**
     * Name to display along the date
     */
    @IsString()
    name: string;

    /**
     * Date description
     */
    @IsString()
    description: string;

    /**
     * Date avatar
     */
    @IsUUID()
    @IsOptional()
    avatar: string;

    /**
     * Date category tags
     */
    @IsString({ each: true })
    tags: string[];

    /**
     * Date signature colors
     */
    @IsHexColor({ each: true })
    @ArrayMinSize(2)
    // tslint:disable-next-line:variable-name
    signature_colors: string[];
}

/**
 * Timestamps of the date
 */
export class DateTimestamps {
    /**
     * Event Begin Date
     */
    @IsDateString()
    // tslint:disable-next-line:variable-name
    event_begin: Date;

    /**
     * Event End Date
     */
    @IsDateString()
    // tslint:disable-next-line:variable-name
    event_end: Date;
}

/**
 * Coordinated with class validator decorator
 */
export class Coordinates {
    /**
     * Longitude
     */
    @IsNumber()
    lon: number;

    /**
     * Latitude
     */
    @IsNumber()
    lat: number;
}

/**
 * Input type for the date location
 */
export class InputDateLocation {
    /**
     * Coordinates of the date
     */
    @ValidateNested()
    @Type(() => Coordinates)
    location: Coordinates;

    /**
     * Location label of the date
     */
    @IsString()
    // tslint:disable-next-line:variable-name
    location_label: string;
}

/**
 * Location of the date
 */
export class DateLocation {
    /**
     * Coordinates of the date
     */
    @ValidateNested()
    @Type(/* istanbul ignore next */ () => Coordinates)
    location: Coordinates;

    /**
     * Location label of the date
     */
    @IsString()
    // tslint:disable-next-line:variable-name
    location_label: string;

    /**
     * City ID
     */
    @IsNumber()
    // tslint:disable-next-line:variable-name
    assigned_city: number;
}

/**
 * A Date is linked to a location and a point in time, and has linked ticket categories
 */
@Entity<DateEntity>({
    table_name: 'date',
    key: ['id'],
    es_index_mapping: {
        discover: '^((?!(location|metadata|timestamps)).*)',
        properties: {
            location: {
                cql_collection: 'singleton',
                properties: {
                    location: {
                        type: 'geo_point',
                        cql_collection: 'singleton',
                    },
                    location_label: {
                        cql_collection: 'singleton',
                        type: 'text',
                    },
                    assigned_city: {
                        cql_collection: 'singleton',
                        type: 'integer',
                    },
                },
            },
            metadata: {
                cql_collection: 'singleton',
                properties: {
                    avatar: {
                        cql_collection: 'singleton',
                        type: 'keyword',
                    },
                    name: {
                        cql_collection: 'singleton',
                        type: 'text',
                    },
                    description: {
                        cql_collection: 'singleton',
                        type: 'text',
                    },
                    tags: {
                        cql_collection: 'list',
                        type: 'text',
                    },
                },
            },
            timestamps: {
                cql_collection: 'singleton',
                properties: {
                    event_begin: {
                        type: 'date',
                        cql_collection: 'singleton',
                    },
                    event_end: {
                        type: 'date',
                        cql_collection: 'singleton',
                    },
                },
            },
        },
    },
} as any)
export class DateEntity {
    /**
     * Entity Builder
     *
     * @param d
     */
    constructor(d?: DateEntity) {
        if (d) {
            this.id = d.id ? d.id.toString() : d.id;
            this.group_id = d.group_id;
            this.status = d.status;
            this.categories = ECAAG(d.categories);
            this.location = d.location;
            this.timestamps = d.timestamps;
            this.metadata = d.metadata;
            this.metadata.tags = ECAAG(this.metadata.tags);
            this.parent_id = d.parent_id ? d.parent_id.toString() : d.parent_id;
            this.parent_type = d.parent_type;
            this.created_at = d.created_at;
            this.updated_at = d.updated_at;
        }
    }

    /**
     * Unique ID of the Date
     */
    @GeneratedUUidColumn()
    id: string;

    /**
     * Current status of the category
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    group_id: string;

    /**
     * Current status of the category
     */
    @Column({
        type: 'text',
    })
    status: 'preview' | 'live';

    /**
     * Ticket categories of the Date
     */
    @Column({
        type: 'list',
        typeDef: '<uuid>',
    })
    categories: string[];

    /**
     * Location info
     */
    @Column({
        type: 'frozen',
        typeDef: '<date_location>',
    })
    location: DateLocation;

    /**
     * Timestamp info
     */
    @Column({
        type: 'frozen',
        typeDef: '<date_timestamps>',
    })
    timestamps: DateTimestamps;

    /**
     * Metadata info
     */
    @Column({
        type: 'frozen',
        typeDef: '<date_metadata>',
    })
    metadata: DateMetadata;

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
}
