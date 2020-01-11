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
        example: {
            $eq: 'test',
        },
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    current_status?: SearchableField<string>;

    @ApiPropertyOptional({
        description: 'Current action of the action sets',
        example: {
            $eq: 'test',
        },
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    current_action?: SearchableField<number>;

    @ApiPropertyOptional({
        description: 'Unique ID to search for',
        example: {
            $eq: 'test',
        },
    })
    @IsOptional()
    id?: SearchableField<string>;

    @ApiPropertyOptional({
        description: 'Actions details to search for',
        example: {
            $eq: 'test',
        },
    })
    @IsOptional()
    actions?: SearchableField<ActionEntity[]>;

    @ApiPropertyOptional({
        description: 'Search by action set name',
        example: {
            $eq: 'test',
        },
    })
    @IsOptional()
    name?: SearchableField<string>;

    @ApiPropertyOptional({
        description: 'Search by creation date',
        example: {
            $eq: 'test',
        },
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    created_at?: SearchableField<Date>;

    @ApiPropertyOptional({
        description: 'Search by update date',
        example: {
            $eq: 'test',
        },
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    updated_at?: SearchableField<Date>;
}
