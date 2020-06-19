import { Reducer } from 'redux';
import { LocationActionTypes, LocationState } from './types';
import { IGetLocation, ISetLocation, LocationAction } from './actions';

export const locationInitialState: LocationState = {
    location: null,
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
    requesting: false,
});

export const LocationReducer: Reducer<LocationState, LocationAction> = (
    state: LocationState = locationInitialState,
    action: LocationAction,
): LocationState => {
    switch (action.type) {
        case LocationActionTypes.SetLocation:
            return SetLocationReducer(state, action as ISetLocation);
        case LocationActionTypes.GetLocation:
            return GetLocationReducer(state, action as IGetLocation);
        default:
            return state;
    }
};
