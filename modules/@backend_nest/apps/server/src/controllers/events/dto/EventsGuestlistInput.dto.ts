import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Date format when recovering the event guestlist
 */
export class EventsGuestlistInputDto {
    /**
     * Date ids on which we need the guest list
     */
    @ApiProperty()
    @IsString({ each: true })
    dateIds: string[];
}
