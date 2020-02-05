import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TxsSubscribeInputDto extends SortablePagedSearch {
    @ApiPropertyOptional({
        description: 'Hash of transaction to follow',
    })
    @IsString()
    // tslint:disable-next-line:variable-name
    transaction_hash: string;
}
