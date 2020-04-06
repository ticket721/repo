import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when adding dates to event
 */
export class EventsAddDatesInputDto {
    /**
     * Dates by IDs to add to event
     */
    @ApiProperty({
        description: 'Date IDs to add',
    })
    @IsUUID('4', { each: true })
    dates: string[];
}
