import {
    IsString,
    ValidateIf,
    IsOptional,
    IsNumber,
    IsIn,
    IsObject,
    ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SearchableField } from '@lib/common/utils/SearchableField.type';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch';
import { ActionEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { Type } from 'class-transformer';

export class ActionsSearchInputDto extends SortablePagedSearch {
    @ApiPropertyOptional({
        description: 'Current status of the searched action sets',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    current_status?: SearchableField<string>;

    @ApiPropertyOptional({
        description: 'Current action of the action sets',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    current_action?: SearchableField<number>;

    @ApiPropertyOptional({
        description: 'Unique ID to search for',
    })
    @IsOptional()
    id?: SearchableField<string>;

    @ApiPropertyOptional({
        description: 'Actions details to search for',
    })
    @IsOptional()
    actions?: SearchableField<ActionEntity[]>;

    @ApiPropertyOptional({
        description: 'Search by action set owner',
    })
    @IsOptional()
    owner?: SearchableField<string>;

    @ApiPropertyOptional({
        description: 'Search by action set name',
    })
    @IsOptional()
    name?: SearchableField<string>;

    @ApiPropertyOptional({
        description: 'Search by creation date',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    created_at?: SearchableField<Date>;

    @ApiPropertyOptional({
        description: 'Search by update date',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    updated_at?: SearchableField<Date>;
}
