import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsIn,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Sort } from '@lib/common/utils/Sort';
import { Type } from 'class-transformer';

// tslint:disable-next-line:max-classes-per-file
export class SortablePagedSearch {
    @ApiPropertyOptional({
        description: 'Sort parameters',
        type: Sort,
        isArray: true,
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(/* istanbul ignore next */ () => Sort)
    @IsOptional()
    $sort?: Sort[];

    @ApiPropertyOptional({
        example: 10,
        description: 'Size of result page',
    })
    @IsNumber()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    $page_size?: number = 10;

    @ApiPropertyOptional({
        example: 0,
        description: 'Page index to return',
    })
    @IsNumber()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    $page_index?: number = 0;
}
