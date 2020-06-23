import { Reducer } from 'redux';
import { LocationActionTypes, LocationState }                             from './types';
import { IGetLocation, ISetCustomLocation, ISetLocation, LocationAction } from './actions';

export const locationInitialState: LocationState = {
    location: null,
    customLocation: null,
    requesting: false,
};

const GetLocationReducer: Reducer<LocationState, IGetLocation> = (
    state: LocationState,
    action: IGetLocation,
): LocationState => ({
    ...state,
    requesting: true,
});

const SetLocationReducer: Reducer<LocationState, ISetLocation> = (
    state: LocationState,
    action: ISetLocation,
): LocationState => ({
    ...state,
    location: action.location,
    customLocation: null,
    requesting: false,
});

const SetCustomLocationReducer: Reducer<LocationState, ISetCustomLocation> = (
    state: LocationState,
    action: ISetCustomLocation,
): LocationState => ({
    ...state,
    customLocation: action.location,
});

export const LocationReducer: Reducer<LocationState, LocationAction> = (
    state: LocationState = locationInitialState,
    action: LocationAction,
): LocationState => {
    switch (action.type) {
        case LocationActionTypes.SetLocation:
            return SetLocationReducer(state, action as ISetLocation);
        case LocationActionTypes.SetCustomLocation:
            return SetCustomLocationReducer(state, action as ISetCustomLocation);
        case LocationActionTypes.GetLocation:
            return GetLocationReducer(state, action as IGetLocation);
        default:
            return state;
    }
};
