import { QuickScore } from 'quick-score';
// tslint:disable-next-line:no-var-requires
const cities = require('./cities.json');

/**
 * Longitude / Latitude Coordinates
 */
export class Coordinates {
    /**
     * Longitude
     */
    lon: number;

    /**
     * Latitude
     */
    lat: number;
}

/**
 * Information about a city
 */
export interface City {
    /**
     * Name of the city
     */
    name: string;

    /**
     * Name with extended ascii support
     */
    nameAscii: string;

    /**
     * Name of the region
     */
    nameAdmin: string;

    /**
     * Name of the country
     */
    country: string;

    /**
     * Coordinates of the city
     */
    coord: Coordinates;

    /**
     * Population count of the city
     */
    population: number;

    /**
     * Unique identifier of the city
     */
    id: number;
}

/**
 * Compute distance between two coordinates
 *
 * @param pos1
 * @param pos2
 */
function computeDistance(pos1: Coordinates, pos2: Coordinates): number {

    if ((pos1.lat === pos2.lat) && (pos1.lon === pos2.lon)) {

        return 0;

    } else {

        const radLat1: number = Math.PI * pos1.lat / 180;
        const radLat2: number = Math.PI * pos2.lat / 180;
        const theta: number = pos1.lon - pos2.lon;
        const radtheta: number = Math.PI * theta / 180;
        let dist: number = Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radtheta);
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        return dist * 1.609344;

    }

}

/**
 * Converts raw city data to City
 *
 * @param data
 */
function rawToStruct(data: any[]): City {
    return {
        name: data[0],
        nameAscii: data[4],
        nameAdmin: data[5],
        country: data[1],
        coord: {
            lat: data[2],
            lon: data[3],
        },
        population: data[6],
        id: data[7],
    } as City;
}

/**
 * Recover closest city to given Coordinates
 *
 * @param pos
 */
export function closestCity(pos: Coordinates): City {
    let distance: number = -1;
    let result: any[] = null;

    for (const city of cities.cities) {
        const resultDistance = computeDistance(pos, {
            lat: city[2],
            lon: city[3],
        });

        if (distance === -1 || resultDistance < distance) {
            result = city;
            distance = resultDistance;
        }
    }

    return rawToStruct(result);
}

/**
 * ParseCities for the fuzzy search query
 */
const parsedCities = cities.cities.map(rawToStruct);

/**
 * QuickSearch Instance
 */
const qs = new QuickScore(parsedCities, {
    keys: ['nameAscii', 'nameAdmin'],
});

/**
 * Fuzzy Search Result
 */
export interface MatchingCity {
    /**
     * Score of the result
     */
    score: number;

    /**
     * Resulting city
     */
    city: City;
}

/**
 * Performs a fuzzy search on the city database
 *
 * @param query
 * @param limit
 */
export function fuzzySearch(query: string, limit: number = 10): MatchingCity[] {
    return qs.search(query).slice(0, limit).map((r: any): MatchingCity => ({
        score: r.score,
        city: r.item
    }));
}

export const citiesList = cities;
