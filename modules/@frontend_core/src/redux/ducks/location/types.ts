import { City } from '@common/global';

export enum LocationActionTypes {
    GetLocation = '@@location/getlocation',
    SetLocation = '@@location/setlocation',
}

export interface UserLocation {
    lon: number;
    lat: number;
    city: City;
}

export interface LocationState {
    requesting: boolean;
    location: UserLocation;
}
