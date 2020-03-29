import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Data Model to subscribe to a specific transaction
 */
export class TxsSubscribeInputDto extends SortablePagedSearch {
    /**
     * Transaction hash to follow
     */
    @ApiProperty({
        description: 'Hash of transaction to follow',
    })
    @IsString()
    // tslint:disable-next-line:variable-name
    transaction_hash: string;
}
