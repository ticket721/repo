import { Action }                     from 'redux';
import { DeviceWalletTypes } from './types';

export interface ISetup extends Action<string> {
    type: DeviceWalletTypes.Setup;
}

export const Setup = (): ISetup => ({
    type: DeviceWalletTypes.Setup,
});

export interface ISetPk extends Action<string> {
    type: DeviceWalletTypes.SetPk;
    pk: string;
}

export const SetPk = (pk: string): ISetPk => ({
    type: DeviceWalletTypes.SetPk,
    pk,
});

export interface IStartRegenInterval extends Action<string> {
    type: DeviceWalletTypes.StartRegenInterval;
    ticketId: string;
}

export const StartRegenInterval = (ticketId: string): IStartRegenInterval => ({
    type: DeviceWalletTypes.StartRegenInterval,
    ticketId,
});

export interface ISetRegenIntervalId extends Action<string> {
    type: DeviceWalletTypes.SetRegenIntervalId;
    id: number;
}

export const SetRegenInterval = (id: number): ISetRegenIntervalId => ({
    type: DeviceWalletTypes.SetRegenIntervalId,
    id,
});

export interface INextGen extends Action<string> {
    type: DeviceWalletTypes.NextGen;
}

export const NextGen = (): INextGen => ({
    type: DeviceWalletTypes.NextGen,
});

export interface IPushSig extends Action<string> {
    type: DeviceWalletTypes.PushSig;
    signature: string;
}

export const PushSig = (signature: string): IPushSig => ({
    type: DeviceWalletTypes.PushSig,
    signature,
});

export interface IResetTicket extends Action<string> {
    type: DeviceWalletTypes.ResetTicket;
}

export const ResetTicket = (): IResetTicket => ({
    type: DeviceWalletTypes.ResetTicket,
});

export interface ISetSeconds extends Action<string> {
    type: DeviceWalletTypes.SetSeconds;
    seconds: number;
}

export const SetSeconds = (seconds: number): ISetSeconds => ({
    type: DeviceWalletTypes.SetSeconds,
    seconds,
});

export type DeviceWalletAction =
    | ISetup
    | ISetPk
    | IStartRegenInterval
    | ISetRegenIntervalId
    | INextGen
    | IPushSig
    | IResetTicket
    | ISetSeconds;
