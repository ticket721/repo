import { Action }                     from 'redux';
import { CurrentEventTypes } from './types';

export interface ISetupDate extends Action<string> {
    type: CurrentEventTypes.SetupDate;
}

export const SetupDate = (): ISetupDate => ({
    type: CurrentEventTypes.SetupDate,
});

export interface ISetEventId extends Action<string> {
    type: CurrentEventTypes.SetEventId;
    eventId: string;
}

export const SetEventId = (eventId: string): ISetEventId => ({
    type: CurrentEventTypes.SetEventId,
    eventId,
});

export interface ISetDate extends Action<string> {
    type: CurrentEventTypes.SetDate;
    dateId: string;
    dateName: string;
}

export const SetDate = (dateId: string, dateName: string): ISetDate => ({
    type: CurrentEventTypes.SetDate,
    dateId,
    dateName,
});

export type CurrentEventAction = ISetupDate | ISetEventId | ISetDate;
