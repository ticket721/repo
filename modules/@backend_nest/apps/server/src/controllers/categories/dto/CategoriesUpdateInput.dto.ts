import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { IsDateString, IsNumber, IsString, ValidateIf, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data model returned when updating a category
 */
export class CategoriesUpdateInputDto
    implements Partial<Pick<CategoryEntity, 'display_name' | 'sale_begin' | 'sale_end' | 'seats' | 'price'>> {
    /**
     * Edits the display name
     */
    @ApiPropertyOptional({
        description: 'Edits the display name of the category',
    })
    @IsString()
    @ValidateIf((_, v) => v !== undefined)
    // tslint:disable-next-line:variable-name
    display_name?: string;

    /**
     * Edits the sale begin date
     */
    @ApiPropertyOptional({
        description: 'Edits the sale start date',
    })
    @IsDateString()
    @ValidateIf((_, v) => v !== undefined)
    // tslint:disable-next-line:variable-name
    sale_begin?: Date;

    /**
     * Edits the sale end date
     */
    @ApiPropertyOptional({
        description: 'Edits the sale end date',
    })
    @IsDateString()
    @ValidateIf((_, v) => v !== undefined)
    // tslint:disable-next-line:variable-name
    sale_end?: Date;

    /**
     * edits the resale begin date
     */
    @ApiPropertyOptional({
        description: 'Edits the resales start date',
    })
    @IsDateString()
    @ValidateIf((_, v) => v !== undefined)
    // tslint:disable-next-line:variable-name
    resale_begin?: Date;

    /**
     * Edits the resale end date
     */
    @ApiPropertyOptional({
        description: 'Edits the resales end date',
    })
    @IsDateString()
    @ValidateIf((_, v) => v !== undefined)
    // tslint:disable-next-line:variable-name
    resale_end?: Date;

    /**
     * Edits the category prices
     */
    @ApiPropertyOptional({
        description: 'Edits the price of the category',
    })
    @ValidateNested({ each: true })
    @ValidateIf((_, v) => v !== undefined)
    price?: number;

    /**
     * Edits the available seat count
     */
    @ApiPropertyOptional({
        description: 'Edits the number of available tickets',
    })
    @IsNumber()
    @ValidateIf((_, v) => v !== undefined)
    seats?: number;
}
