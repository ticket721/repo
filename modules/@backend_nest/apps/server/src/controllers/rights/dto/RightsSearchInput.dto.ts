import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { SearchableField } from '@lib/common/utils/SearchableField.type';

/**
 * Search Query Paramaters to fetch Rights
 */
export class RightsSearchInputDto extends SortablePagedSearch {
    /**
     * Query by ID
     */
    @ApiPropertyOptional({
        description: 'Entity of the Right',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    entity_type?: SearchableField<string>;

    /**
     * Query by ID
     */
    @ApiPropertyOptional({
        description: 'Entity Value of the Right',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    entity_value?: SearchableField<string>;

    /**
     * Query by creation date
     */
    @ApiPropertyOptional({
        description: 'Creation date of the Right',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    created_at?: SearchableField<Date>;

    /**
     * Query by update date
     */
    @ApiPropertyOptional({
        description: 'Update date of the Right',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    updated_at?: SearchableField<Date>;
}
