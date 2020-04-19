import { Action } from 'redux';

export const SetupActions = {
    Start: '@@setup/start',
    StartVtx: '@@setup/startvtx',
    SetDeviceInfos: '@@setup/setdeviceinfos',
};

export interface IStart extends Action<string> {}

export const Start = (): IStart => ({
    type: SetupActions.Start,
});

export interface IStartVtx extends Action<string> {}

export const StartVtx = (): IStartVtx => ({
    type: SetupActions.StartVtx,
});

export interface ISetDeviceInfos extends Action<string> {
    device: string;
    browser: string;
}

export const SetDeviceInfos = (device: string, browser: string): ISetDeviceInfos => ({
    type: SetupActions.SetDeviceInfos,
    device,
    browser,
});

export type SetupActionTypes = IStart | IStartVtx | ISetDeviceInfos;
