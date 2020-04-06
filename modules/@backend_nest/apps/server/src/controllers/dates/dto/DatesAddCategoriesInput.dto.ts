import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when add a category to a Date
 */
export class DatesAddCategoriesInputDto {
    /**
     * List of categories by id to add
     */
    @ApiProperty({
        description: 'Category IDs to add',
    })
    @IsUUID('4', { each: true })
    categories: string[];
}
