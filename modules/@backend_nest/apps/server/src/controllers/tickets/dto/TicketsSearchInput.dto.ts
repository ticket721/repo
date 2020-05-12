import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { SearchableField } from '@lib/common/utils/SearchableField.type';

/**
 * Search Query Paramaters to fetch Tickets
 */
export class TicketsSearchInputDto extends SortablePagedSearch {
    /**
     * Query by ID
     */
    @ApiPropertyOptional({
        description: 'Unique ID of the Ticket',
    })
    @IsOptional()
    id?: SearchableField<string>;

    /**
     * Query by Group ID
     */
    @ApiPropertyOptional({
        description: 'Group ID of the Ticket',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    group_id?: SearchableField<string>;

    /**
     * Query by Category ID
     */
    @ApiPropertyOptional({
        description: 'Category ID of the Ticket',
    })
    @IsOptional()
    category?: SearchableField<string>;

    /**
     * Query by owner address
     */
    @ApiPropertyOptional({
        description: 'Owner Address of the Ticket',
    })
    @IsOptional()
    owner?: SearchableField<string>;

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
