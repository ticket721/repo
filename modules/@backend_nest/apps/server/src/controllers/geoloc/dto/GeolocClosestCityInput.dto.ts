import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

/**
 * Data model required when requesting for the closest available city from one lon/lat set of coords
 */
export class GeolocClosestCityInputDto {
    /**
     * Longitude of position
     */
    @ApiProperty()
    @IsNumber()
    lon: number;

    /**
     * Latitude of position
     */
    @ApiProperty()
    @IsNumber()
    lat: number;
}
