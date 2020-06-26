import { EventCreationActionTypes, EventCreationState } from './types';
import { Action }                                       from 'redux';
import { EventCreationActions } from '../../../core/event_creation/EventCreationCore';
import {
    ActionSetStatus,
    ActionStatus
}            from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';

export interface IInitEventAcset extends Action<string> {
    type: EventCreationActionTypes.InitEventAcset;
}

export const InitEventAcset = (): IInitEventAcset => ({
    type: EventCreationActionTypes.InitEventAcset,
});

export interface ISetEventAcset extends Action<string> {
    type: EventCreationActionTypes.SetEventAcset;
    acsetData: EventCreationState;
}

export const SetEventAcset = (acsetData: EventCreationState): ISetEventAcset => ({
    type: EventCreationActionTypes.SetEventAcset,
    acsetData,
});

export interface ISetAcsetStatus extends Action<string> {
    type: EventCreationActionTypes.SetAcsetStatus;
    acsetStatus: ActionSetStatus;
}

export const SetAcsetStatus = (acsetStatus: ActionSetStatus): ISetAcsetStatus => ({
    type: EventCreationActionTypes.SetAcsetStatus,
    acsetStatus,
});

export interface ISetActionsStatuses extends Action<string> {
    type: EventCreationActionTypes.SetActionsStatuses;
    actionsStatuses: Array<ActionStatus>;
}

export const SetActionsStatuses = (actionsStatuses: Array<ActionStatus>): ISetActionsStatuses => ({
    type: EventCreationActionTypes.SetActionsStatuses,
    actionsStatuses,
});

export interface ISetCurrentActionIdx extends Action<string> {
    type: EventCreationActionTypes.SetCurrentActionIdx;
    idx: number;
}

export const SetCurrentActionIdx = (idx: number): ISetCurrentActionIdx => ({
    type: EventCreationActionTypes.SetCurrentActionIdx,
    idx,
});

export interface ISetCurrentAction extends Action<string> {
    type: EventCreationActionTypes.SetCurrentAction;
    currentAction: EventCreationActions;
}

export const SetCurrentAction = (currentAction: EventCreationActions): ISetCurrentAction => ({
    type: EventCreationActionTypes.SetCurrentAction,
    currentAction,
});

export interface ISetActionData extends Action<string> {
    type: EventCreationActionTypes.SetActionData;
    action: EventCreationActions;
    data: any;
}

export const SetActionData = (action: EventCreationActions, data: any): ISetActionData => ({
    type: EventCreationActionTypes.SetActionData,
    action,
    data,
});

export interface ISetSync extends Action<string> {
    type: EventCreationActionTypes.SetSync;
    sync: boolean;
}

export const SetSync = (sync: boolean): ISetSync => ({
    type: EventCreationActionTypes.SetSync,
    sync,
});

export interface IUpdateAction extends Action<string> {
    type: EventCreationActionTypes.UpdateAction;
}

export const UpdateAction = (): IUpdateAction => ({
    type: EventCreationActionTypes.UpdateAction,
});

export type EventCreationAction =
    IInitEventAcset
    & ISetEventAcset
    & ISetAcsetStatus
    & ISetActionsStatuses
    & ISetCurrentActionIdx
    & ISetCurrentAction
    & ISetActionData
    & ISetSync
    & IUpdateAction;
