import { City } from '@common/geoloc';

/**
 * Data model returned when requesting for the closest available city from one lon/lat set of coords
 */
export class GeolocClosestCityResponseDto {
    /**
     * Closest city from given coordinates
     */
    city: City;
}
