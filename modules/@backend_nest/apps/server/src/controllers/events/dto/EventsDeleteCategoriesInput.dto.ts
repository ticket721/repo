import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when deleting categories from event
 */
export class EventsDeleteCategoriesInputDto {
    /**
     * Categories by IDs to delete from event
     */
    @ApiProperty({
        description: 'Category IDs to delete',
    })
    @IsUUID(undefined, { each: true })
    categories: string[];
}
