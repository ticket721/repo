import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch';
import { Coordinates } from '@ticket721sources/global';
import { Category, DateMetadata } from '@lib/common/dates/entities/Date.entity';
import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

/**
 * Input required by the Dates Search
 */
export class DatesSearchInputDto extends SortablePagedSearch {
    /**
     * Searchable field to search by id
     */
    @ApiPropertyOptional({
        description: 'Unique ID of the Date',
    })
    @IsOptional()
    id?: SearchableField<string>;

    /**
     * Searchable field to search by location_label
     */
    @ApiPropertyOptional({
        description: 'Location Label of the Date',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    location_label?: SearchableField<string>;

    /**
     * Searchable field to search by location
     */
    @ApiPropertyOptional({
        description: 'Location of the Date',
    })
    @IsOptional()
    location?: SearchableField<Coordinates>;

    /**
     * Searchable field to search by assigned_city
     */
    @ApiPropertyOptional({
        description: 'Assigned City of the Date',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    assigned_city?: SearchableField<number>;

    /**
     * Searchable field to search by categories
     */
    @ApiPropertyOptional({
        description: 'Ticket Categories of the Date',
    })
    @IsOptional()
    categories?: SearchableField<Category[]>;

    /**
     * Searchable field to search by metadata
     */
    @ApiPropertyOptional({
        description: 'Metadata of the Date',
    })
    @IsOptional()
    metadata?: SearchableField<DateMetadata>;

    /**
     * Searchable field to search by creation date
     */
    @ApiPropertyOptional({
        description: 'Creation date of the Date',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    created_at?: SearchableField<Date>;

    /**
     * Searchable field to search by update date
     */
    @ApiPropertyOptional({
        description: 'Update date of the Date',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    updated_at?: SearchableField<Date>;
}
