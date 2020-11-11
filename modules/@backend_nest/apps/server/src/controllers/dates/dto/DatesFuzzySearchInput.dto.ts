import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * Input required by the Dates fuzzy Search
 */
export class DatesFuzzySearchInputDto {
    /**
     * Latitude of the requesting user
     */
    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    lat?: number;

    /**
     * Longitude of the requesting user
     */
    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    lon?: number;

    /**
     * String used for the fuzzy search
     */
    @ApiProperty()
    @IsString()
    query: string;
}
