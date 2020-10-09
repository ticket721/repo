import { DateCreationPayload } from '@common/global';
import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EventsAddDateInputDto {
    @ApiProperty({
        description: 'Date creation payload',
    })
    @IsObject()
    date: DateCreationPayload;
}
