import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model used to put an event in live mode
 */
export class EventsStartInputDto {
    /**
     * ID of the event to start
     */
    @ApiProperty()
    @IsUUID()
    event: string;

    /**
     * Dates to set status to live. If none, all dates will be live
     */
    @IsArray()
    @IsUUID()
    @IsOptional()
    dates?: string[];
}
