import { MatchingCity } from '@common/geoloc';

/**
 * Data model returned when fuzzy searching for cities
 */
export class GeolocFuzzySearchResponseDto {
    /**
     * List of cities matching the fuzzy search request
     */
    cities: MatchingCity[];
}
