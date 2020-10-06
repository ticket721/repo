import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Sort } from '@lib/common/utils/Sort.type';
import { SearchInputType } from '@lib/common/utils/SearchInput.type';
import {
    Coordinates,
    DateEntity,
    DateLocation,
    DateMetadata,
    DateTimestamps,
} from '@lib/common/dates/entities/Date.entity';
import { IsOptional } from 'class-validator';

/**
 * Input required by the Dates Search
 */
export class DatesSearchInputDto implements SearchInputType<DateEntity> {
    /**
     * Searchable field to search by id
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    id: SearchableField<string>;

    /**
     * Searchable field to search by group_id
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    group_id: SearchableField<string>;

    /**
     * Searchable field to search by event
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    event: SearchableField<string>;

    /**
     * Searchable field to search by status
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    status: SearchableField<'preview' | 'live'>;

    /**
     * Searchable field to search by categories
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    categories: SearchableField<string[]>;

    /**
     * Searchable field to search by location
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    location: SearchableField<DateLocation>;

    /**
     * Nested value of location
     */
    @ApiPropertyOptional()
    @IsOptional()
    'location.location': SearchableField<Coordinates>;

    /**
     * Nested value of location
     */
    @ApiPropertyOptional()
    @IsOptional()
    'location.location_label': SearchableField<string>;

    /**
     * Nested value of location
     */
    @ApiPropertyOptional()
    @IsOptional()
    'location.assigned_city': SearchableField<string>;

    /**
     * Searchable field to search by timestamps
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    timestamps: SearchableField<DateTimestamps>;

    /**
     * Nested value of timestamps
     */
    @ApiPropertyOptional()
    @IsOptional()
    'timestamps.event_begin': SearchableField<Date>;

    /**
     * Nested value of timestamps
     */
    @ApiPropertyOptional()
    @IsOptional()
    'timestamps.event_end': SearchableField<Date>;

    /**
     * Searchable field to search by metadata
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    metadata: SearchableField<DateMetadata>;

    /**
     * Nested value of metadata
     */
    @ApiPropertyOptional()
    @IsOptional()
    'metadata.name': SearchableField<string>;

    /**
     * Nested value of metadata
     */
    @ApiPropertyOptional()
    @IsOptional()
    'metadata.description': SearchableField<string>;

    /**
     * Nested value of metadata
     */
    @ApiPropertyOptional()
    @IsOptional()
    'metadata.avatar': SearchableField<string>;

    /**
     * Nested value of metadata
     */
    @ApiPropertyOptional()
    @IsOptional()
    'metadata.tags': SearchableField<string[]>;

    /**
     * Nested value of metadata
     */
    @ApiPropertyOptional()
    @IsOptional()
    'metadata.signature_colors': SearchableField<string[]>;

    /**
     * Searchable field to search by parent_id
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    parent_id: SearchableField<string>;

    /**
     * Searchable field to search by parent_type
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    parent_type: SearchableField<string>;

    /**
     * Searchable field to search by create_at
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    created_at: SearchableField<Date>;

    /**
     * Searchable field to search by updated_at
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    updated_at: SearchableField<Date>;

    /**
     * Sort arguments
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    $sort: Sort[];

    /**
     * Page size argument
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    $page_size: number;

    /**
     * Page index argument
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    $page_index: number;
}
