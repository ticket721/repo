import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';
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
        description: 'Unique ID of the Group',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    group_id?: SearchableField<string>;
}
