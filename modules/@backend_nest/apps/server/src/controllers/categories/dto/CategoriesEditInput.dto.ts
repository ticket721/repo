import { CategoryCreationPayload } from '@common/global';
import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when editing a category
 */
export class CategoriesEditInputDto {
    /**
     * Fields to edit
     */
    @ApiProperty({
        description: 'Category edition payload',
    })
    @IsObject()
    category: Partial<CategoryCreationPayload>;
}
