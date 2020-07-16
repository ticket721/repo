import { Reducer }                                                                                   from 'redux';
import { CurrentEventState, CurrentEventTypes }                          from './types';
import { ISetEventId, ISetDate, CurrentEventAction } from './actions';

export const currentEventInitialState: CurrentEventState = {
    eventId: '',
    dateId: '',
    dateName: '',
};

const SetEventIdReducer: Reducer<CurrentEventState, ISetEventId> = (
    state: CurrentEventState,
    action: ISetEventId,
): CurrentEventState => {
    localStorage.setItem('currentEvent', action.eventId);
    return {
        ...state,
        eventId: action.eventId
    }
};

const SetDateIdReducer: Reducer<CurrentEventState, ISetDate> = (
    state: CurrentEventState,
    action: ISetDate,
): CurrentEventState => {
    localStorage.setItem('currentDateId', action.dateId);
    localStorage.setItem('currentDateName', action.dateName);

    return {
        ...state,
        dateId: action.dateId,
        dateName: action.dateName,
    }
};

export const CurrentEventReducer: Reducer<CurrentEventState, CurrentEventAction> = (
    state: CurrentEventState = currentEventInitialState,
    action: CurrentEventAction,
): CurrentEventState => {
    switch (action.type) {
        case CurrentEventTypes.SetEventId:
            return SetEventIdReducer(state, action as ISetEventId);
        case CurrentEventTypes.SetDate:
            return SetDateIdReducer(state, action as ISetDate);
        default:
            return state;
    }
};
