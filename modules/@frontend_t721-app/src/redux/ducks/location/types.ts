import { City } from '@common/global';

export enum LocationActionTypes {
    GetLocation = '@@location/getlocation',
    SetLocation = '@@location/setlocation',
    SetCustomLocation = '@@location/setcustomlocation'
}

export interface UserLocation {
    lon: number;
    lat: number;
    city: City;
    online: boolean;
}

export interface LocationState {
    requesting: boolean;
    location: UserLocation;
    customLocation: UserLocation;
}
