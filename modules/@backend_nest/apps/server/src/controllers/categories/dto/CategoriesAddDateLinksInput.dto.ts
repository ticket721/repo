import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when adding new date links
 */
export class CategoriesAddDateLinksInputDto {
    /**
     * The date IDs to link to the category
     */
    @ApiProperty({ isArray: true })
    @IsUUID('4', { each: true })
    dates: string[];
}
