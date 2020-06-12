import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { Sort } from '@lib/common/utils/Sort.type';
import { SearchInputType } from '@lib/common/utils/SearchInput.type';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';

/**
 * Search Query Paramaters to fetch Tickets
 */
export class TicketsSearchInputDto implements SearchInputType<TicketEntity> {
    /**
     * Searchable field to search by id
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    id: SearchableField<string>;

    /**
     * Searchable field to search by authorization
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    authorization: SearchableField<string>;

    /**
     * Searchable field to search by owner
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    owner: SearchableField<string>;

    /**
     * Searchable field to search by env
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    env: SearchableField<'chain' | 'db'>;

    /**
     * Searchable field to search by status
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    status: SearchableField<'minting' | 'ready' | 'canceled'>;

    /**
     * Searchable field to search by transaction_hash
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    transaction_hash: SearchableField<string>;

    /**
     * Searchable field to search by category
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    category: SearchableField<string>;

    /**
     * Searchable field to search by group_id
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    group_id: SearchableField<string>;

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
