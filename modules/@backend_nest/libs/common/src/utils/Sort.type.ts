import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

/**
 * Field and order to sort with
 */
export class Sort {
    /**
     * Field to use for sorting
     */
    @ApiProperty({
        example: null,
        description: 'Field to use to sort',
    })
    @IsString()
    // tslint:disable-next-line:variable-name
    $field_name: string;

    /**
     * Order to use for sorting
     */
    @ApiProperty({
        example: null,
        description: 'Order of the sort, asc or desc',
    })
    @IsString()
    @IsIn(['asc', 'desc'])
    // tslint:disable-next-line:variable-name
    $order: string;

    /**
     * Order to use for sorting
     */
    @ApiPropertyOptional({
        example: null,
        description: 'True if ordering on nested field',
    })
    @IsBoolean()
    @IsOptional()
    $nested?: boolean;
}
