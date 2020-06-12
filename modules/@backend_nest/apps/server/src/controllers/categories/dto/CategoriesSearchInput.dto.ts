import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { SearchInputType } from '@lib/common/utils/SearchInput.type';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { Price } from '@lib/common/currencies/Currencies.service';
import { Sort } from '@lib/common/utils/Sort.type';

/**
 * Data model required when searching for a category
 */
export class CategoriesSearchInputDto implements SearchInputType<CategoryEntity> {
    /**
     * Searchable field to search by id
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    id: SearchableField<string>;

    /**
     * Searchable field to search by group_id
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    group_id: SearchableField<string>;

    /**
     * Searchable field to search by category_name
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    category_name: SearchableField<string>;

    /**
     * Searchable field to search by display
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    display_name: SearchableField<string>;

    /**
     * Searchable field to search by sale_begin
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    sale_begin: SearchableField<Date>;

    /**
     * Searchable field to search by sale_end
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    sale_end: SearchableField<Date>;

    /**
     * Searchable field to search by resale_begin
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    resale_begin: SearchableField<Date>;

    /**
     * Searchable field to search by resale_end
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    resale_end: SearchableField<Date>;

    /**
     * Searchable field to search by scope
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    scope: SearchableField<string>;

    /**
     * Searchable field to search by prices
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    prices: SearchableField<Price[]>;

    /**
     * Searchable field to search by seats
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    seats: SearchableField<number>;

    /**
     * Searchable field to search by reserved
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    reserved: SearchableField<number>;

    /**
     * Searchable field to search by parent_id
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    parent_id: SearchableField<string>;

    /**
     * Searchable field to search by parent_type
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    parent_type: SearchableField<string>;

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
