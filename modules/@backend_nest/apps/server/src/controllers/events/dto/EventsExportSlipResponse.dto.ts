import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Details about a tarification
 */
export class TarificationData {
    /**
     * ID of the category
     */
    @ApiProperty({
        description: 'ID of the category',
    })
    @IsString()
    id: string;

    /**
     * New date details
     */
    @ApiProperty({
        description: 'Name of tarification',
    })
    @IsString()
    name: string;

    /**
     * New date details
     */
    @ApiProperty({
        description: 'Version of tarification',
    })
    @IsNumber()
    version: number;

    /**
     * Price for tarification
     */
    @ApiProperty({
        description: 'Price for tarification',
    })
    @IsNumber()
    price: number;

    /**
     * Currency used
     */
    @ApiProperty({
        description: 'Currency used',
    })
    @IsString()
    currency: string;

    /**
     * Amount sold
     */
    @ApiProperty({
        description: 'Amount sold',
    })
    @IsNumber()
    amount: number;
}

/**
 * Data model returned when fetching slip
 */
export class EventsExportSlipResponseDto {
    /**
     * New date details
     */
    @ApiProperty({
        description: 'Date creation payload',
    })
    @ValidateNested({ each: true })
    @Type(() => TarificationData)
    tarifications: TarificationData[];
}
