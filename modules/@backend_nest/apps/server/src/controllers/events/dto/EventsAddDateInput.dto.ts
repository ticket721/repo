import { DateCreationPayload } from '@common/global';
import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when adding a new date
 */
export class EventsAddDateInputDto {
    /**
     * New date details
     */
    @ApiProperty({
        description: 'Date creation payload',
    })
    @IsObject()
    date: DateCreationPayload;
}
