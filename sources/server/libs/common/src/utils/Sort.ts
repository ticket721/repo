import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class Sort {
    @ApiProperty({
        example: null,
        description: 'Field to use to sort',
    })
    @IsString()
    // tslint:disable-next-line:variable-name
    $field_name: string;

    @ApiProperty({
        example: null,
        description: 'Order of the sort, asc or desc',
    })
    @IsString()
    @IsIn(['asc', 'desc'])
    // tslint:disable-next-line:variable-name
    $order: string;
}
