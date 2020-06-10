import { State as VtxState } from 'ethvtx/lib/state';
import { configureVtx, getInitialState, getReducers } from 'ethvtx/lib';

import { createMemoryHistory } from 'history';

import { connectRouter } from 'connected-react-router';

import { ConfigsState, ConfigsReducer, configsInitialState } from './configs';

import { UserPropertiesState, UserPropertiesReducer, userPropertiesInitialState } from './user_properties';

import { StatusesState, StatusesReducer, statusesInitialState } from './statuses';

import { cacheInitialState, CacheReducer, CacheState } from './cache';

import { authInitialState, AuthReducer, AuthState } from './auth';

import { notificationsInitialState, NotificationsReducer, NotificationsState } from './notifications';
import { Reducer } from 'redux';

export const history = createMemoryHistory();

export interface SpecificState {
    configs: ConfigsState;
    statuses: StatusesState;
    userProperties: UserPropertiesState;
    cache: CacheState;
    auth: AuthState;
    notifications: NotificationsState;
}

export type AppState = SpecificState & VtxState;

export type AdditionalReducer<AdditionalState> = {
    [key in keyof AdditionalState]: Reducer<AdditionalState[key], any>;
};

export const rootReducer = <AdditionalState>(additionalReducer?: AdditionalReducer<AdditionalState>) =>
    getReducers({
        ...additionalReducer,
        configs: ConfigsReducer,
        router: connectRouter(history),
        statuses: StatusesReducer,
        userProperties: UserPropertiesReducer,
        cache: CacheReducer,
        auth: AuthReducer,
        notifications: NotificationsReducer,
    });

export const initialState = <AdditionalState>(additionalState?: AdditionalState): AppState & AdditionalState =>
    configureVtx<AppState & AdditionalState>(
        getInitialState({
            ...additionalState,
            userProperties: userPropertiesInitialState,
            configs: configsInitialState,
            statuses: statusesInitialState,
            cache: cacheInitialState,
            auth: authInitialState,
            notifications: notificationsInitialState,
        }) as AppState & AdditionalState,
        {
            confirmation_threshold: 2,
            poll_timer: 300,
        },
    );
