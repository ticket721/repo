import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { SearchableField } from '@lib/common/utils/SearchableField.type';

/**
 * Data model required when searching for a category
 */
export class CategoriesSearchInputDto extends SortablePagedSearch {
    /**
     * Filter by Group ID
     */
    @ApiPropertyOptional({
        description: 'Unique ID of the Group',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    group_id?: SearchableField<string>;
}
