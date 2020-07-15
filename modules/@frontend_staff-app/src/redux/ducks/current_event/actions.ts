import { Action }                     from 'redux';
import { CurrentEventTypes } from './types';

export interface ISetEventId extends Action<string> {
    type: CurrentEventTypes.SetEventId;
    eventId: string;
}

export const SetEventId = (eventId: string): ISetEventId => ({
    type: CurrentEventTypes.SetEventId,
    eventId,
});

export interface ISetDateId extends Action<string> {
    type: CurrentEventTypes.SetDateId;
    dateId: string;
}

export const SetDateId = (dateId: string): ISetDateId => ({
    type: CurrentEventTypes.SetDateId,
    dateId,
});

export type CurrentEventAction = ISetEventId | ISetDateId;
