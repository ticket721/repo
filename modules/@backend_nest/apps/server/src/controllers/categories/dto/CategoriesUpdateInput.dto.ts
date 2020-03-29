import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { InputPrice } from '@lib/common/currencies/Currencies.service';
import { IsDateString, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data model returned when updating a category
 */
export class CategoriesUpdateInputDto
    implements
        Partial<
            Pick<CategoryEntity, 'display_name' | 'sale_begin' | 'sale_end' | 'resale_begin' | 'resale_end' | 'seats'>
        > {
    /**
     * Edits the display name
     */
    @ApiPropertyOptional({
        description: 'Edits the display name of the category',
    })
    @IsString()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    display_name?: string;

    /**
     * Edits the sale begin date
     */
    @ApiPropertyOptional({
        description: 'Edits the sale start date',
    })
    @IsDateString()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    sale_begin?: Date;

    /**
     * Edits the sale end date
     */
    @ApiPropertyOptional({
        description: 'Edits the sale end date',
    })
    @IsDateString()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    sale_end?: Date;

    /**
     * edits the resale begin date
     */
    @ApiPropertyOptional({
        description: 'Edits the resales start date',
    })
    @IsDateString()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    resale_begin?: Date;

    /**
     * Edits the resale end date
     */
    @ApiPropertyOptional({
        description: 'Edits the resales end date',
    })
    @IsDateString()
    @IsOptional()
    // tslint:disable-next-line:variable-name
    resale_end?: Date;

    /**
     * Edits the category prices
     */
    @ApiPropertyOptional({
        description: 'Edits the prices of the category',
    })
    @ValidateNested({ each: true })
    @Type(() => InputPrice)
    @IsOptional()
    prices?: InputPrice[];

    /**
     * Edits the available seat count
     */
    @ApiPropertyOptional({
        description: 'Edits the number of available tickets',
    })
    @IsNumber()
    @IsOptional()
    seats?: number;
}
