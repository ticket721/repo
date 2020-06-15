import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { SearchInputType } from '@lib/common/utils/SearchInput.type';
import { Sort } from '@lib/common/utils/Sort.type';
import { GemOrderEntity, RawGemEntity } from '@lib/common/gemorders/entities/GemOrder.entity';

/**
 * Search Query Paramaters to fetch Gem Orders
 */
export class DosojinSearchInputDto implements SearchInputType<GemOrderEntity> {
    /**
     * Searchable field to search by id
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    id: SearchableField<string>;

    /**
     * Searchable field to search by distribution_id
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    distribution_id: SearchableField<number>;

    /**
     * Searchable field to search by circuit_name
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    circuit_name: SearchableField<string>;

    /**
     * Searchable field to search by initial_arguments
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    initial_arguments: SearchableField<string>;

    /**
     * Searchable field to search by gem
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    gem: SearchableField<RawGemEntity>;

    /**
     * Searchable field to search by initialized
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    initialized: SearchableField<boolean>;

    /**
     * Searchable field to search by refresh_timer
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    refresh_timer: SearchableField<number>;

    /**
     * Searchable field to search by created_at
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    created_at: SearchableField<Date>;

    /**
     * Searchable field to search by
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
