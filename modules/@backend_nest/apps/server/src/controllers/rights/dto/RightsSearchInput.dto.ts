import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { SearchInputType } from '@lib/common/utils/SearchInput.type';
import { RightEntity } from '@lib/common/rights/entities/Right.entity';
import { Sort } from '@lib/common/utils/Sort.type';

/**
 * Search Query Paramaters to fetch Rights
 */
export class RightsSearchInputDto implements SearchInputType<RightEntity> {
    /**
     * Searchable field to search by grantee_id
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    grantee_id: SearchableField<string>;

    /**
     * Searchable field to search by entity_type
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    entity_type: SearchableField<string>;

    /**
     * Searchable field to search by entity_value
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    entity_value: SearchableField<string>;

    /**
     * Searchable field to search by rights
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    rights: SearchableField<{ [key: string]: boolean }>;

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
