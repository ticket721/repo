import { IsString }    from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EventsCreateInputDto {
    @ApiProperty()
    @IsString()
    name: string;
}
