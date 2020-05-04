import { City } from '@common/global';

export interface UserProperties {
    device: string;
    browser: string;
    city: City;
}

export enum UserPropertiesActionTypes {
    GetDevice = '@@userproperties/getdevice',
    GetCity = '@@userproperties/getcity',
    SetDeviceInfos = '@@userproperties/setdeviceinfos',
    SetCity = '@@userproperties/setcity'
}

export interface UserPropertiesState {
    readonly loading: boolean;
    readonly user: UserProperties;
    readonly errors?: [];
}
