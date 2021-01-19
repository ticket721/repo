import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Sort } from '@lib/common/utils/Sort.type';
import { SearchInputType } from '@lib/common/utils/SearchInput.type';
import { InvitationEntity } from '@lib/common/invitations/entities/Invitation.entity';

/**
 * Data model for the invitation search query
 */
export class InvitationsSearchInputDto implements SearchInputType<InvitationEntity> {
    /**
     * Searchable field to search by id
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    id: SearchableField<string>;

    /**
     * Searchable field to search by status
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    owner: SearchableField<string>;

    /**
     * Searchable field to search by owner
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    dates: SearchableField<string[]>;

    /**
     * Searchable field to search by description
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    description: SearchableField<string>;

    /**
     * Searchable field to search by group_id
     */
    @ApiPropertyOptional()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    group_id: SearchableField<string>;

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
