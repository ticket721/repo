import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch';
import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

/**
 * Data model for the event search query
 */
export class TxsSearchInputDto extends SortablePagedSearch {
    /**
     * Query by events id
     */
    @ApiPropertyOptional({
        description: 'Unique ID of the Tx',
    })
    @IsOptional()
    @IsObject()
    // tslint:disable-next-line:variable-name
    transaction_hash?: SearchableField<string>;

    /**
     * Query by events id
     */
    @ApiPropertyOptional({
        description: 'Sender of the Tx',
    })
    @IsOptional()
    @IsObject()
    // tslint:disable-next-line:variable-name
    from?: SearchableField<string>;

    /**
     * Query by events id
     */
    @ApiPropertyOptional({
        description: 'Destination of the Tx',
    })
    @IsOptional()
    @IsObject()
    // tslint:disable-next-line:variable-name
    to?: SearchableField<string>;
}
