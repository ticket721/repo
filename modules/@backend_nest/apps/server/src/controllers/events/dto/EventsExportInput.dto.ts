import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when requesting an complete export
 */
export class EventsExportInputDto {
    /**
     * Categories to filter by
     */
    @ApiProperty({
        description: 'Categories of tickets to fetch',
    })
    @IsUUID('4', { each: true })
    categories?: string[];
}
