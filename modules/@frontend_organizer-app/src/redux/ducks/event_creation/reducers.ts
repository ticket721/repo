import {
    EventCreationAction,
    IResetEventAcset,
    ISetAcsetStatus,
    ISetActionData,
    ISetCompletedStep,
    ISetCurrentAction,
    ISetCurrentActionIdx,
    ISetEventAcset,
    ISetSync,
    IUpdateAction,
}                                                       from './actions';
import { EventCreationActionTypes, EventCreationState } from './types';
import { Reducer }                                      from 'redux';
import { EventCreationActions, EventCreationSteps }     from '../../../core/event_creation/EventCreationCore';

export const eventCreationInitialState: EventCreationState = {
    acsetId: '',
    acsetStatus: null,
    currentActionIdx: null,
    currentAction: null,
    completedStep: EventCreationSteps.None,
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

const SetCurrentActionIdxReducer: Reducer<EventCreationState, ISetCurrentActionIdx> = (
    state: EventCreationState,
    action: ISetCurrentActionIdx,
): EventCreationState => ({
    ...state,
    currentActionIdx: action.idx,
})

const SetEventAcsetReducer: Reducer<EventCreationState, ISetEventAcset> = (
    state: EventCreationState,
    action: ISetEventAcset,
): EventCreationState => action.acsetData;

const ResetEventAcsetReducer: Reducer<EventCreationState, IResetEventAcset> = (
    state: EventCreationState,
    action: IResetEventAcset,
): EventCreationState => eventCreationInitialState;

const SetCurrentActionReducer: Reducer<EventCreationState, ISetCurrentAction> = (
    state: EventCreationState,
    action: ISetCurrentAction,
): EventCreationState => ({
    ...state,
    currentAction: action.currentAction
});

const SetCompletedStepReducer: Reducer<EventCreationState, ISetCompletedStep> = (
    state: EventCreationState,
    action: ISetCompletedStep,
): EventCreationState => ({
    ...state,
    completedStep: action.completedStep
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
        case EventCreationActionTypes.SetCurrentActionIdx:
            return SetCurrentActionIdxReducer(state, action as ISetCurrentActionIdx);
        case EventCreationActionTypes.SetEventAcset:
            return SetEventAcsetReducer(state, action as ISetEventAcset);
        case EventCreationActionTypes.ResetEventAcset:
            return ResetEventAcsetReducer(state, action as IResetEventAcset);
        case EventCreationActionTypes.SetCurrentAction:
            return SetCurrentActionReducer(state, action as ISetCurrentAction);
        case EventCreationActionTypes.SetCompletedStep:
            return SetCompletedStepReducer(state, action as ISetCompletedStep);
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
