import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

/**
 * Input Dto extension to recover paging arguments
 */
export class PagedSearch {
    /**
     * Specifies the size of the pages
     */
    @ApiPropertyOptional({
        example: 10,
        description: 'Size of result page',
    })
    @IsNumber()
    // tslint:disable-next-line:variable-name
    $page_size: number = 10;

    /**
     * Specifies the required page
     */
    @ApiPropertyOptional({
        example: 0,
        description: 'Page index to return',
    })
    @IsNumber()
    // tslint:disable-next-line:variable-name
    $page_index: number = 0;
}
