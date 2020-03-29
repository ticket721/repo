import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when adding category to event
 */
export class EventsAddCategoriesInputDto {
    /**
     * Category IDs to add to event
     */
    @ApiProperty({
        description: 'Category IDs to add',
    })
    @IsUUID('4', { each: true })
    categories: string[];
}
