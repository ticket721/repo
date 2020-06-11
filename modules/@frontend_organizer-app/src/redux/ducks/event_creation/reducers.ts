import {
    EventCreationAction,
    IResetEventAcset,
    ISetActionData,
    ISetCompletedStep,
    ISetCurrentAction,
    ISetEventAcset,
    ISetSync,
    IUpdateAction,
}                                                       from './actions';
import { EventCreationActionTypes, EventCreationState } from './types';
import { Reducer }                                      from 'redux';
import { EventCreationSteps }                           from '../../../core/event_creation/EventCreationCore';

export const eventCreationInitialState: EventCreationState = {
    acsetId: '',
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
