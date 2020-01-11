import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsString } from 'class-validator';

export class PagedSearch {
    @ApiPropertyOptional({
        example: 10,
        description: 'Size of result page',
    })
    @IsNumber()
    // tslint:disable-next-line:variable-name
    $page_size: number = 10;

    @ApiPropertyOptional({
        example: 0,
        description: 'Page index to return',
    })
    @IsNumber()
    // tslint:disable-next-line:variable-name
    $page_index: number = 0;
}
