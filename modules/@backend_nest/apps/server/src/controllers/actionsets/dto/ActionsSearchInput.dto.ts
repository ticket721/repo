import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { ActionEntity, ActionSetEntity, ActionSetStatus } from '@lib/common/actionsets/entities/ActionSet.entity';
import { SearchInputType } from '@lib/common/utils/SearchInput.type';
import { Link } from '@lib/common/utils/Link.type';
import { Sort } from '@lib/common/utils/Sort.type';

/**
 * Extended type extending entity
 */
export class ActionsSearchInputDto implements SearchInputType<ActionSetEntity> {
    /**
     * Searchable field to search on the current_status
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    current_status: SearchableField<ActionSetStatus>;

    /**
     * Searchable field to search on the current_action
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    current_action: SearchableField<number>;

    /**
     * Searchable field to search on the id
     */
    @ApiPropertyOptional()
    @IsOptional()
    id: SearchableField<string>;

    /**
     * Searchable field to search in the actions
     */
    @ApiPropertyOptional()
    @IsOptional()
    actions: SearchableField<ActionEntity[]>;

    /**
     * Searchable field to search on the name
     */
    @ApiPropertyOptional()
    @IsOptional()
    name: SearchableField<string>;

    /**
     * Searchable field to search on the creation timestamp
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    created_at: SearchableField<Date>;

    /**
     * Searchable field to search on the update timestamp
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    updated_at: SearchableField<Date>;

    /**
     * Searchable field to search on the update timestamp
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    links: SearchableField<Link[]>;
    /**
     * Searchable field to search on the dispatched timestamp
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    dispatched_at: SearchableField<Date>;

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
