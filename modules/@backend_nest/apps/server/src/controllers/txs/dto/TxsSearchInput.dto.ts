import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Sort } from '@lib/common/utils/Sort.type';
import { SearchInputType } from '@lib/common/utils/SearchInput.type';
import { Log, TxEntity } from '@lib/common/txs/entities/Tx.entity';

/**
 * Data Model when searching for transactions
 */
export class TxsSearchInputDto implements SearchInputType<TxEntity> {
    /**
     * Searchable field to search by transaction_hash
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    transaction_hash: SearchableField<string>;

    /**
     * Searchable field to search by transaction_hash
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    real_transaction_hash: SearchableField<string>;

    /**
     * Searchable field to search by confirmed
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    confirmed: SearchableField<boolean>;

    /**
     * Searchable field to search by status
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    status: SearchableField<boolean>;

    /**
     * Searchable field to search by block_hash
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    block_hash: SearchableField<string>;

    /**
     * Searchable field to search by block_number
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    block_number: SearchableField<number>;

    /**
     * Searchable field to search by transaction_index
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    transaction_index: SearchableField<number>;

    /**
     * Searchable field to search by from_
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    from_: SearchableField<string>;

    /**
     * Searchable field to search by to_
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    to_: SearchableField<string>;

    /**
     * Searchable field to search by contract_address
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    contract_address: SearchableField<string>;

    /**
     * Searchable field to search by cumulative_gas_used
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    cumulative_gas_used: SearchableField<string>;

    /**
     * Searchable field to search by cumulative_gas_used_ln
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    cumulative_gas_used_ln: SearchableField<number>;

    /**
     * Searchable field to search by gas_used
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    gas_used: SearchableField<string>;

    /**
     * Searchable field to search by gas_used_ln
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    gas_used_ln: SearchableField<number>;

    /**
     * Searchable field to search by gas_price
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    gas_price: SearchableField<string>;

    /**
     * Searchable field to search by gas_price_ln
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    gas_price_ln: SearchableField<number>;

    /**
     * Searchable field to search by logs
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    logs: SearchableField<Log[]>;

    /**
     * Searchable field to search by logs_bloom
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    logs_bloom: SearchableField<string>;

    /**
     * Searchable field to search by created_at
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    created_at: SearchableField<Date>;

    /**
     * Searchable field to search by updated_at
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    updated_at: SearchableField<Date>;

    /**
     * Sort arguments
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    $sort: Sort[];

    /**
     * Page size argument
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    $page_size: number;

    /**
     * Page index argument
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    $page_index: number;
}
