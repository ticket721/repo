import { IGetCity, IGetDevice, ISetCity, ISetDeviceInfos, UserPropertiesAction } from './actions';
import { UserPropertiesActionTypes, UserPropertiesState } from './types';
import { Reducer } from 'redux';

export const userPropertiesInitialState: UserPropertiesState = {
    user: {
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
        },
    },
    errors: [],
    loading: false,
};

const GetDeviceReducer: Reducer<UserPropertiesState, IGetDevice> = (
    state: UserPropertiesState,
    action: IGetDevice,
): UserPropertiesState => ({
    ...state,
    loading: true,
});

const SetDeviceInfosReducer: Reducer<UserPropertiesState, ISetDeviceInfos> = (
    state: UserPropertiesState,
    action: ISetDeviceInfos,
): UserPropertiesState => ({
    ...userPropertiesInitialState,
    user: {
        ...state.user,
        device: action.device,
        browser: action.browser,
    },
});

const GetCityReducer: Reducer<UserPropertiesState, IGetCity> = (
    state: UserPropertiesState,
    action: IGetCity,
): UserPropertiesState => ({
    ...state,
    loading: true,
});

const SetCityReducer: Reducer<UserPropertiesState, ISetCity> = (
    state: UserPropertiesState,
    action: ISetCity,
): UserPropertiesState => ({
    ...userPropertiesInitialState,
    user: {
        ...state.user,
        city: action.city,
    },
});

export const UserPropertiesReducer: Reducer<UserPropertiesState, UserPropertiesAction> = (
    state: UserPropertiesState = userPropertiesInitialState,
    action: UserPropertiesAction,
): UserPropertiesState => {
    switch (action.type) {
        case UserPropertiesActionTypes.GetDevice:
            return GetDeviceReducer(state, action as IGetDevice);
        case UserPropertiesActionTypes.SetDeviceInfos:
            return SetDeviceInfosReducer(state, action as ISetDeviceInfos);
        case UserPropertiesActionTypes.GetCity:
            return GetCityReducer(state, action as IGetCity);
        case UserPropertiesActionTypes.SetCity:
            return SetCityReducer(state, action as ISetCity);
        default:
            return state;
    }
};
