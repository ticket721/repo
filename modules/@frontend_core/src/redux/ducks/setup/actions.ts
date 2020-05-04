import { SetupActionTypes } from './types';
import { Action }           from 'redux';

export interface IStart extends Action<string> {
    type: SetupActionTypes.Start
}

export const Start = (): IStart => ({
    type: SetupActionTypes.Start
});

export interface IStartVtx extends Action<string> {
    type: SetupActionTypes.StartVtx
}

export const StartVtx = (): IStartVtx => ({
    type: SetupActionTypes.StartVtx
});

export type SetupAction = IStart & IStartVtx;
