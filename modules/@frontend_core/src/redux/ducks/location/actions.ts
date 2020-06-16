import { Action } from 'redux';
import { LocationActionTypes, UserLocation } from './types';

export interface IGetLocation extends Action<string> {
    type: LocationActionTypes.GetLocation;
}

export const GetLocation = (): IGetLocation => ({
    type: LocationActionTypes.GetLocation,
});

export interface ISetLocation extends Action<string> {
    type: LocationActionTypes.SetLocation;
    location: UserLocation;
}

export const SetLocation = (location: UserLocation): ISetLocation => ({
    type: LocationActionTypes.SetLocation,
    location,
});

export type LocationAction = IGetLocation | ISetLocation;
