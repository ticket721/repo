import { ISetAppStatus, IToggleOnlineStatus, StatusesAction } from './actions';
import { AppStatus, OnlineStatus, StatusesActionTypes, StatusesState } from './types';
import { Reducer } from 'redux';

export const statusesInitialState: StatusesState = {
    onlineStatus: OnlineStatus.Undeterminded,
    appStatus: AppStatus.Loading,
};

const ToggleOnlineStatusReducer: Reducer<StatusesState, IToggleOnlineStatus> = (
    state: StatusesState,
    action: IToggleOnlineStatus,
): StatusesState => ({
    ...state,
    onlineStatus: state.onlineStatus === OnlineStatus.Online ? OnlineStatus.Offline : OnlineStatus.Online,
});

const SetAppStatusReducer: Reducer<StatusesState, ISetAppStatus> = (
    state: StatusesState,
    action: ISetAppStatus,
): StatusesState => ({
    ...state,
    appStatus: action.status,
});

export const StatusesReducer: Reducer<StatusesState, StatusesAction> = (
    state: StatusesState = statusesInitialState,
    action: StatusesAction,
): StatusesState => {
    switch (action.type) {
        case StatusesActionTypes.ToggleOnlineStatus:
            return ToggleOnlineStatusReducer(state, action as IToggleOnlineStatus);
        case StatusesActionTypes.SetAppStatus:
            return SetAppStatusReducer(state, action as ISetAppStatus);
        default:
            return state;
    }
};
