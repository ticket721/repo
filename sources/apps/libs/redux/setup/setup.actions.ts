import { Action } from 'redux';

export const SetupActions = {
    Start: '@setup/start'
};

export interface IStart extends Action<string> {}

export const Start = (): IStart => ({
    type: SetupActions.Start,
});

export type SetupActionTypes = IStart;
