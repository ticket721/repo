import { City } from '@common/global';

export interface PropertiesState {
    device: string;
    browser: string;
    city: City;
}

export const InitialPropertiesState: PropertiesState = {
    device: null,
    browser: null,
    city: {
        name: null,
        nameAdmin: null,
        nameAscii: null,
        country: null,
        coord: {
            lon: null,
            lat: null,
        },
        population: null,
        id: null,
    }
};
