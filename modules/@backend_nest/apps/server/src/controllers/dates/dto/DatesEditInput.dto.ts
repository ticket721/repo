import { DateCreationPayload } from '@common/global';
import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DatesEditInputDto {
    @ApiProperty({
        description: 'Date edition payload',
    })
    @IsObject()
    date: Partial<DateCreationPayload>;
}
