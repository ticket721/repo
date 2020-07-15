import { Reducer }                                                                                   from 'redux';
import { CurrentEventState, CurrentEventTypes }                          from './types';
import { ISetEventId, ISetDateId, CurrentEventAction } from './actions';

export const currentEventInitialState: CurrentEventState = {
    eventId: '',
    dateId: '',
};

const SetEventIdReducer: Reducer<CurrentEventState, ISetEventId> = (
    state: CurrentEventState,
    action: ISetEventId,
): CurrentEventState => ({
    ...state,
    eventId: action.eventId
});

const SetDateIdReducer: Reducer<CurrentEventState, ISetDateId> = (
    state: CurrentEventState,
    action: ISetDateId,
): CurrentEventState => ({
    ...state,
    dateId: action.dateId
});

export const CurrentEventReducer: Reducer<CurrentEventState, CurrentEventAction> = (
    state: CurrentEventState = currentEventInitialState,
    action: CurrentEventAction,
): CurrentEventState => {
    switch (action.type) {
        case CurrentEventTypes.SetEventId:
            return SetEventIdReducer(state, action as ISetEventId);
        case CurrentEventTypes.SetDateId:
            return SetDateIdReducer(state, action as ISetDateId);
        default:
            return state;
    }
};
