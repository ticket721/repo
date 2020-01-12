import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Sort } from '@lib/common/utils/Sort';

/**
 * Input Dto extension to recover sort arguments
 */
export class SortableSearch {
    /**
     * Can contain one or more sorting requirements
     */
    @ApiPropertyOptional({
        description: 'Sort parameters',
    })
    @IsOptional()
    $sort?: Sort[];
}
