import { IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch';
import { ActionEntity } from '@lib/common/actionsets/entities/ActionSet.entity';

/**
 * Input required by the Actions Search
 */
export class ActionsHashInputDto extends SortablePagedSearch {
    /**
     * Fields to use to generate the hash.
     */
    @ApiProperty({
        description: 'Fields to use to generate the hash',
    })
    @IsArray()
    // tslint:disable-next-line:variable-name
    hash_fields: string[];

    /**
     * Searchable field to search on the current_status
     */
    @ApiPropertyOptional({
        description: 'Current status of the searched action sets',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    current_status?: SearchableField<string>;

    /**
     * Searchable field to search on the current_action
     */
    @ApiPropertyOptional({
        description: 'Current action of the action sets',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    current_action?: SearchableField<number>;

    /**
     * Searchable field to search on the id
     */
    @ApiPropertyOptional({
        description: 'Unique ID to search for',
    })
    @IsOptional()
    id?: SearchableField<string>;

    /**
     * Searchable field to search in the actions
     */
    @ApiPropertyOptional({
        description: 'Actions details to search for',
    })
    @IsOptional()
    actions?: SearchableField<ActionEntity[]>;

    /**
     * Searchable field to search on the name
     */
    @ApiPropertyOptional({
        description: 'Search by action set name',
    })
    @IsOptional()
    name?: SearchableField<string>;

    /**
     * Searchable field to search on the creation timestamp
     */
    @ApiPropertyOptional({
        description: 'Search by creation date',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    created_at?: SearchableField<Date>;

    /**
     * Searchable field to search on the update timestamp
     */
    @ApiPropertyOptional({
        description: 'Search by update date',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    updated_at?: SearchableField<Date>;
}
