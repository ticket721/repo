import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { IsDateString, IsHexadecimal, IsNumber, IsString, Length, ValidateNested } from 'class-validator';
import { InputPrice } from '@lib/common/currencies/Currencies.service';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data model required when creating a category
 */
export class CategoriesCreateInputDto
    implements
        Pick<
            CategoryEntity,
            'group_id' | 'display_name' | 'sale_begin' | 'sale_end' | 'resale_begin' | 'resale_end' | 'seats'
        > {
    /**
     * Group ID of the category
     */
    @ApiProperty({
        description: 'Group ID of the category to create',
    })
    @IsHexadecimal()
    @Length(66, 66)
    // tslint:disable-next-line:variable-name
    group_id: string;

    /**
     * Display Name of the category
     */
    @ApiProperty({
        description: 'Displayed name of the category',
    })
    @IsString()
    // tslint:disable-next-line:variable-name
    display_name: string;

    /**
     * Sale start date of the category
     */
    @ApiProperty({
        description: 'Begin date of the sale',
    })
    @IsDateString()
    // tslint:disable-next-line:variable-name
    sale_begin: Date;

    /**
     * Sale end date of the category
     */
    @ApiProperty({
        description: 'End date of the sale',
    })
    @IsDateString()
    // tslint:disable-next-line:variable-name
    sale_end: Date;

    /**
     * Resale start date of the category
     */
    @ApiProperty({
        description: 'Begin date of the resales',
    })
    @IsDateString()
    // tslint:disable-next-line:variable-name
    resale_begin: Date;

    /**
     * Resale end date of the category
     */
    @ApiProperty({
        description: 'End date of the resales',
    })
    @IsDateString()
    // tslint:disable-next-line:variable-name
    resale_end: Date;

    /**
     * Prices of the category
     */
    @ApiProperty({
        description: 'Prices of the category tickets',
    })
    @ValidateNested({ each: true })
    @Type(() => InputPrice)
    prices: InputPrice[];

    /**
     * Available seats of the category
     */
    @ApiProperty({
        description: 'Number of available tickets',
    })
    @IsNumber()
    seats: number;
}
