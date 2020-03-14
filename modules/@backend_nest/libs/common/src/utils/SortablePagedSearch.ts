import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Sort } from '@lib/common/utils/Sort';
import { Type } from 'class-transformer';

/**
 * Input Dto extension to recover sort arguments
 */
export class SortablePagedSearch {
    /**
     * Can contain one or more sorting requirements
     */
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

    /**
     * Specifies the size of the pages
     */
    @ApiPropertyOptional({
        example: 10,
        description: 'Size of result page',
    })
    @IsNumber()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    $page_size?: number = 10;

    /**
     * Specifies the required page
     */
    @ApiPropertyOptional({
        example: 0,
        description: 'Page index to return',
    })
    @IsNumber()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    $page_index?: number = 0;
}
