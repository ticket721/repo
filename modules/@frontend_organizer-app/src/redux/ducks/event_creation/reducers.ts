import {
    EventCreationAction,
    ISetAcsetStatus,
    ISetActionData,
    ISetActionsStatuses,
    ISetCurrentAction,
    ISetCurrentActionIdx,
    ISetEventAcset,
    ISetSync,
    IUpdateAction,
} from './actions';
import { EventCreationActionTypes, EventCreationState } from './types';
import { Reducer }                                      from 'redux';
import { EventCreationActions }     from '../../../core/event_creation/EventCreationCore';

export const eventCreationInitialState: EventCreationState = {
    acsetId: '',
    acsetStatus: null,
    actionsStatuses: [],
    currentActionIdx: null,
    currentAction: null,
    textMetadata: {
        name: '',
        description: '',
        tags: [],
    },
    imagesMetadata: {
        avatar: '',
        signatureColors: [],
    },
    modulesConfiguration: {},
    datesConfiguration: {
        dates: []
    },
    categoriesConfiguration: {
        global: [],
        dates: [],
    },
    adminsConfiguration: {
        admins: []
    },
    sync: true,
};

const SetAcsetStatusReducer: Reducer<EventCreationState, ISetAcsetStatus> = (
    state: EventCreationState,
    action: ISetAcsetStatus,
): EventCreationState => ({
    ...state,
    acsetStatus: action.acsetStatus,
});

const SetActionsStatusesReducer: Reducer<EventCreationState, ISetActionsStatuses> = (
    state: EventCreationState,
    action: ISetActionsStatuses,
): EventCreationState => ({
    ...state,
    actionsStatuses: action.actionsStatuses,
});

const SetCurrentActionIdxReducer: Reducer<EventCreationState, ISetCurrentActionIdx> = (
    state: EventCreationState,
    action: ISetCurrentActionIdx,
): EventCreationState => ({
    ...state,
    currentActionIdx: action.idx,
});

const SetEventAcsetReducer: Reducer<EventCreationState, ISetEventAcset> = (
    state: EventCreationState,
    action: ISetEventAcset,
): EventCreationState => action.acsetData;

const SetCurrentActionReducer: Reducer<EventCreationState, ISetCurrentAction> = (
    state: EventCreationState,
    action: ISetCurrentAction,
): EventCreationState => ({
    ...state,
    currentAction: action.currentAction
});

const SetActionDataReducer: Reducer<EventCreationState, ISetActionData> = (
    state: EventCreationState,
    action: ISetActionData,
): EventCreationState => {
    if (action.action === EventCreationActions.DatesConfiguration) {
        const filteredData = {
            dates: action.data.dates ? action.data.dates.map((dateItem: any) => ({
                eventBegin: dateItem.eventBegin,
                eventEnd: dateItem.eventEnd,
                location: dateItem.location,
                name: dateItem.name,
            })) : []
        };

        return {
            ...state,
            [action.action]: filteredData,
        };
    }

    return {
        ...state,
        [action.action]: {
            ...eventCreationInitialState[action.action],
            ...action.data,
        },
    };
};

const SetSyncReducer: Reducer<EventCreationState, ISetSync> = (
    state: EventCreationState,
    action: ISetSync,
): EventCreationState => ({
    ...state,
    sync: action.sync
});

const UpdateActionReducer: Reducer<EventCreationState, IUpdateAction> = (
    state: EventCreationState,
    action: IUpdateAction,
): EventCreationState => ({
    ...state,
    sync: false,
});

export const EventCreationReducer: Reducer<EventCreationState, EventCreationAction> = (
    state: EventCreationState = eventCreationInitialState,
    action: EventCreationAction,
): EventCreationState => {
    switch (action.type) {
        case EventCreationActionTypes.SetAcsetStatus:
            return SetAcsetStatusReducer(state, action as ISetAcsetStatus);
        case EventCreationActionTypes.SetActionsStatuses:
            return SetActionsStatusesReducer(state, action as ISetActionsStatuses);
        case EventCreationActionTypes.SetCurrentActionIdx:
            return SetCurrentActionIdxReducer(state, action as ISetCurrentActionIdx);
        case EventCreationActionTypes.SetEventAcset:
            return SetEventAcsetReducer(state, action as ISetEventAcset);
        case EventCreationActionTypes.SetCurrentAction:
            return SetCurrentActionReducer(state, action as ISetCurrentAction);
        case EventCreationActionTypes.SetActionData:
            return SetActionDataReducer(state, action as ISetActionData);
        case EventCreationActionTypes.SetSync:
            return SetSyncReducer(state, action as ISetSync);
        case EventCreationActionTypes.UpdateAction:
            return UpdateActionReducer(state, action as IUpdateAction);
        default:
            return state;
    }
};
