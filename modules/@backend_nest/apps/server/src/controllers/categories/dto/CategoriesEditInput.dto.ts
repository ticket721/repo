import { CategoryCreationPayload } from '@common/global';
import { IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

    /**
     * Optional dates
     */
    @ApiPropertyOptional({
        description: 'Category dates',
    })
    @IsOptional()
    dates: string[];
}
