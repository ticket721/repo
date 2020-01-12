import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

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
}
