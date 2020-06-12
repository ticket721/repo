import { createMemoryHistory } from 'history';

import { connectRouter } from 'connected-react-router';

import { ConfigsState, ConfigsReducer, configsInitialState } from './configs';

import { UserPropertiesState, UserPropertiesReducer, userPropertiesInitialState } from './user_properties';

import { StatusesState, StatusesReducer, statusesInitialState } from './statuses';

import { cacheInitialState, CacheReducer, CacheState } from './cache';

import { authInitialState, AuthReducer, AuthState } from './auth';

import { notificationsInitialState, NotificationsReducer, NotificationsState } from './notifications';
import { Reducer } from 'redux';
import { combineReducers } from 'redux';

export const history = createMemoryHistory();

export interface SpecificState {
    configs: ConfigsState;
    statuses: StatusesState;
    userProperties: UserPropertiesState;
    cache: CacheState;
    auth: AuthState;
    notifications: NotificationsState;
}

export type AppState = SpecificState;

export type AdditionalReducer<AdditionalState> = {
    [key in keyof AdditionalState]: Reducer<AdditionalState[key], any>;
};

export const rootReducer = <AdditionalState>(additionalReducer?: AdditionalReducer<AdditionalState>) =>
    combineReducers({
        ...additionalReducer,
        configs: ConfigsReducer,
        router: connectRouter(history),
        statuses: StatusesReducer,
        userProperties: UserPropertiesReducer,
        cache: CacheReducer,
        auth: AuthReducer,
        notifications: NotificationsReducer,
    });

export const initialState = <AdditionalState>(additionalState?: AdditionalState): AppState & AdditionalState => ({
    ...additionalState,
    userProperties: userPropertiesInitialState,
    configs: configsInitialState,
    statuses: statusesInitialState,
    cache: cacheInitialState,
    auth: authInitialState,
    notifications: notificationsInitialState,
});
