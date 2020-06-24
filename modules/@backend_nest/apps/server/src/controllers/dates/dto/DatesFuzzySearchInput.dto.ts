import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

/**
 * Input required by the Dates fuzzy Search
 */
export class DatesFuzzySearchInputDto {
    /**
     * Latitude of the requesting user
     */
    @ApiProperty()
    @IsNumber()
    lat: number;

    /**
     * Longitude of the requesting user
     */
    @ApiProperty()
    @IsNumber()
    lon: number;

    /**
     * String used for the fuzzy search
     */
    @ApiProperty()
    @IsString()
    query: string;
}
