import { AppStatus, StatusesActionTypes } from './types';
import { Action }                         from 'redux';

export interface IToggleOnlineStatus extends Action<string> {
    type: StatusesActionTypes.ToggleOnlineStatus;
}

export const ToggleOnlineStatus = (): IToggleOnlineStatus => ({
    type: StatusesActionTypes.ToggleOnlineStatus
});

export interface ISetAppStatus extends Action<string> {
    type: StatusesActionTypes.SetAppStatus;
    status: AppStatus;
}

export const SetAppStatus = (status: AppStatus): ISetAppStatus => ({
    type: StatusesActionTypes.SetAppStatus,
    status,
});

export type StatusesAction =
    IToggleOnlineStatus
    & ISetAppStatus;
