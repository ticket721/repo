import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { Sort } from '@lib/common/utils/Sort';

export class SortableSearch {
    @ApiPropertyOptional({
        description: 'Sort parameters',
    })
    @IsOptional()
    // tslint:disable-next-line:variable-name
    $sort?: Sort[];
}
