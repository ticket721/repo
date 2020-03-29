import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data model used to put an event in live mode
 */
export class EventsStartInputDto {
    /**
     * ID of the event to start
     */
    @ApiProperty({
        description: 'event ID to start',
    })
    @IsUUID()
    event: string;

    /**
     * Dates to set status to live. If none, all dates will be live
     */
    @ApiPropertyOptional({
        description: 'Date IDs to start. If omitted, all dates are started.',
    })
    @IsArray()
    @IsUUID()
    @IsOptional()
    dates?: string[];
}
