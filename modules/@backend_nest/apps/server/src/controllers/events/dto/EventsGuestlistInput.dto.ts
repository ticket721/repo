import { IsNumber, IsString } from 'class-validator';
import { ApiProperty }        from '@nestjs/swagger';

/**
 * Date format when recovering the event guestlist
 */
export class EventsGuestlistInputDto {
    @ApiProperty()
    @IsString({each: true})
    dateIds: string[];
}
