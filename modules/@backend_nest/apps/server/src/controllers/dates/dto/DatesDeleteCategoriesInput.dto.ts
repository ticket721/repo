import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Date model required when deleting a category from a date
 */
export class DatesDeleteCategoriesInputDto {
    /**
     * Categories to delete from the date
     */
    @ApiProperty({
        description: 'Category IDs to remove',
    })
    @IsUUID('4', { each: true })
    categories: string[];
}
