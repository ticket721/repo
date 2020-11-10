import { CategoryCreationPayload } from '@common/global';
import { IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data model required when adding acategory to a date
 */
export class DatesAddCategoryInputDto {
    /**
     * Category details
     */
    @ApiProperty({
        description: 'Category creation payload',
    })
    @IsObject()
    category: CategoryCreationPayload;

    @ApiPropertyOptional()
    @IsOptional()
    otherDates: string[];
}
