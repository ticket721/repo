import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { SearchableField } from '@lib/common/utils/SearchableField.type';

/**
 * Search Query Paramaters to fetch Gem Orders
 */
export class GemOrdersSearchInputDto extends SortablePagedSearch {
    /**
     * Query by ID
     */
    @ApiPropertyOptional({
        description: 'Unique ID of the Gem Order',
    })
    @IsOptional()
    id?: SearchableField<number>;

    /**
     * Query by creation date
     */
    @ApiPropertyOptional({
        description: 'Creation date of the Gem Order',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    created_at?: SearchableField<Date>;

    /**
     * Query by update date
     */
    @ApiPropertyOptional({
        description: 'Update date of the Gem Order',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    updated_at?: SearchableField<Date>;
}
