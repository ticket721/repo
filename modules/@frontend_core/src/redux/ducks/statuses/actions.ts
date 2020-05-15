import { StatusesActionTypes } from './types';
import { Action }                                  from 'redux';

export interface IToggleOnlineStatus extends Action<string> {
    type: StatusesActionTypes.ToggleOnlineStatus;
}

export const ToggleOnlineStatus = (): IToggleOnlineStatus => ({
    type: StatusesActionTypes.ToggleOnlineStatus
});

export type StatusesAction =
    IToggleOnlineStatus;
