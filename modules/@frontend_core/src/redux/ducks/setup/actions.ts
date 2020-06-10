import { SetupActionTypes } from './types';
import { Action } from 'redux';

export interface IStart extends Action<string> {
    type: SetupActionTypes.Start;
}

export const Start = (): IStart => ({
    type: SetupActionTypes.Start,
});

export type SetupAction = IStart;
