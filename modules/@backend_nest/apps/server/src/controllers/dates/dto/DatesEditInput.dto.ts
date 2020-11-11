import { DateCreationPayload } from '@common/global';
import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when editing a date
 */
export class DatesEditInputDto {
    /**
     * Date edition payload
     */
    @ApiProperty({
        description: 'Date edition payload',
    })
    @IsObject()
    date: Partial<DateCreationPayload>;
}
