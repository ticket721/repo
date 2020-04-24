import { State as VtxState }                          from 'ethvtx/lib/state';
import { configureVtx, getInitialState, getReducers } from 'ethvtx/lib';

import { createMemoryHistory } from 'history';

import { connectRouter }   from 'connected-react-router';
import {
    ConfigsState,
    ConfigsReducer,
    configsInitialState,
} from './configs';
import {
    UserPropertiesState,
    UserPropertiesReducer,
    userPropertiesInitialState,
} from './user_properties';

import {
    StatusesState,
    StatusesReducer,
    statusesInitialState,
} from './statuses';

export const history = createMemoryHistory();

export interface SpecificState {
    configs: ConfigsState;
    statuses: StatusesState;
    userProperties: UserPropertiesState;
}

export type AppState = SpecificState & VtxState;

export const rootReducer = getReducers({
    configs: ConfigsReducer,
    router: connectRouter(history),
    statuses: StatusesReducer,
    userProperties: UserPropertiesReducer
});

export const initialState: AppState = configureVtx<AppState>(getInitialState<SpecificState>(
    {
        userProperties: userPropertiesInitialState,
        configs: configsInitialState,
        statuses: statusesInitialState
    }) as AppState,
    {
        confirmation_threshold: 2,
        poll_timer: 300
    });
