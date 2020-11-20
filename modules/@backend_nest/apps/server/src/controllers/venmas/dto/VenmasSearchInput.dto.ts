import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { Sort } from '@lib/common/utils/Sort.type';
import { SearchInputType } from '@lib/common/utils/SearchInput.type';
import { Sections, VenmasEntity } from '@lib/common/venmas/entities/Venmas.entity';

/**
 * Search Query Paramaters to fetch Tickets
 */
export class VenmasSearchInputDto implements SearchInputType<VenmasEntity> {
    /**
     * Searchable field to search by id
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    id: SearchableField<string>;

    /**
     * Searchable field to search by name
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    name: SearchableField<string>;

    /**
     * Searchable field to search by owner
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    owner: SearchableField<string>;

    /**
     * Searchable field to search by map
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    map: SearchableField<string>;

    /**
     * Searchable field to search by sections
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    sections: SearchableField<Sections>;

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
