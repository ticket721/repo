import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';
import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

/**
 * Data Model when searching for transactions
 */
export class TxsSearchInputDto extends SortablePagedSearch {
    /**
     * Search by transaction_hash field
     */
    @ApiPropertyOptional({
        description: 'Unique ID of the Tx',
    })
    @IsOptional()
    @IsObject()
    // tslint:disable-next-line:variable-name
    transaction_hash?: SearchableField<string>;

    /**
     * Search by from field
     */
    @ApiPropertyOptional({
        description: 'Sender of the Tx',
    })
    @IsOptional()
    @IsObject()
    // tslint:disable-next-line:variable-name
    from?: SearchableField<string>;

    /**
     * Search by to field
     */
    @ApiPropertyOptional({
        description: 'Destination of the Tx',
    })
    @IsOptional()
    @IsObject()
    // tslint:disable-next-line:variable-name
    to?: SearchableField<string>;
}
