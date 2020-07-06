import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * Data model required when fuzzy searching for cities
 */
export class GeolocFuzzySearchInputDto {
    /**
     * Query to use for fuzzy searching
     */
    @ApiProperty()
    @IsString()
    query: string;

    /**
     * Max result count
     */
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    limit?: number;
}
