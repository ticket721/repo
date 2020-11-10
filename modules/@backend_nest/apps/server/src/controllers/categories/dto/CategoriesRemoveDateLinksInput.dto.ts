import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when removing date links from a category
 */
export class CategoriesRemoveDateLinksInputDto {
    /**
     * Array of date ids to remove
     */
    @ApiProperty({ isArray: true })
    @IsUUID('4', { each: true })
    dates: string[];
}
