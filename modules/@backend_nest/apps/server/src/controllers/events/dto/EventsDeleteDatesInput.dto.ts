import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when deleting dates from event
 */
export class EventsDeleteDatesInputDto {
    /**
     * Dates by IDs to remove from event
     */
    @ApiProperty({
        description: 'Date IDs to remove',
    })
    @IsUUID('4', { each: true })
    dates: string[];
}
