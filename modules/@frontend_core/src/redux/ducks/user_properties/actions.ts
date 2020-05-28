import { UserPropertiesActionTypes } from './types';
import { City } from '@common/global';
import { Action } from 'redux';

export interface IGetDevice extends Action<string> {
    type: UserPropertiesActionTypes.GetDevice;
}

export const GetDevice = (): IGetDevice => ({
    type: UserPropertiesActionTypes.GetDevice,
});

export interface ISetDeviceInfos extends Action<string> {
    type: UserPropertiesActionTypes.SetDeviceInfos;
    device: string;
    browser: string;
}

export const SetDeviceInfos = (device: string, browser: string): ISetDeviceInfos => ({
    type: UserPropertiesActionTypes.SetDeviceInfos,
    device,
    browser,
});

export interface IGetCity extends Action<string> {
    type: UserPropertiesActionTypes.GetCity;
}

export const GetCity = (): IGetCity => ({
    type: UserPropertiesActionTypes.GetCity,
});

export interface ISetCity extends Action<string> {
    type: UserPropertiesActionTypes.SetCity;
    city: City;
}

export const SetCity = (city: City): ISetCity => ({
    type: UserPropertiesActionTypes.SetCity,
    city,
});

export type UserPropertiesAction = ISetDeviceInfos & ISetCity & IGetDevice & IGetCity;
