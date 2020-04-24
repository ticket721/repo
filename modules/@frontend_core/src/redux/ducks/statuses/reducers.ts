import { IToggleOnlineStatus, StatusesAction }                         from './actions';
import { AppStatus, OnlineStatus, StatusesActionTypes, StatusesState } from './types';
import { Reducer }                                                     from 'redux';

export const statusesInitialState: StatusesState = {
    onlineStatus: OnlineStatus.Undeterminded,
    appStatus: AppStatus.Loading
};

const ToggleOnlineStatusReducer: Reducer<StatusesState, IToggleOnlineStatus> =
    (state: StatusesState, action: IToggleOnlineStatus): StatusesState => ({
        ...state,
        onlineStatus: state.onlineStatus === OnlineStatus.Online ? OnlineStatus.Offline : OnlineStatus.Online
    });

export const StatusesReducer: Reducer<StatusesState, StatusesAction> =
    (state: StatusesState = statusesInitialState, action: StatusesAction): StatusesState => {
        switch (action.type) {
            case StatusesActionTypes.ToggleOnlineStatus:
                return ToggleOnlineStatusReducer(state, action as IToggleOnlineStatus);
            default:
                return state;
        }
    };
