import { CategoryCreationPayload } from '@common/global';
import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
