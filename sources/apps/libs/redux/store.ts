import { createStore, applyMiddleware, Reducer, Store, compose } from 'redux';
import createSagaMiddleware                                      from 'redux-saga';
import { State }                                                 from 'ethvtx/lib/state';
import { configureVtx, getInitialState, getReducers, getSagas }  from 'ethvtx';
import { Saga }                                                  from '@redux-saga/types';
import { AppState, InitialAppState }                             from './states/app.state';
import { VtxContract }                                           from 'ethvtx/lib/contracts/VtxContract';
import { FooReducer }                                            from './reducers/foo.reducers';
import { FooSaga }                                               from './sagas/foo.sagas';
import '../utils/window';
import { SetupSaga }                                             from '@libs/redux/setup/setup.sagas';
import { entryPoint }                                            from '@libs/redux/entryPoint';
import { configureVtx, getInitialState, getReducers, getSagas }  from 'ethvtx/lib';
import { SetupReducer }                                          from '@libs/redux/setup/setup.reducers';
import {createMemoryHistory} from 'history';
import {connectRouter, routerMiddleware} from 'connected-react-router';

export type AppState = SpecificState & State;

export const history = createMemoryHistory();

export const initialState: AppState = configureVtx<AppState>(getInitialState<SpecificState>(InitialAppState) as AppState, {
    confirmation_threshold: 2,
    poll_timer: 300
});

export function configureStore(): Store<AppState> {

    const reducers: Reducer<AppState> = getReducers({
        properties: SetupReducer,
        router: connectRouter(history)
    });

    const sagaMiddleware = createSagaMiddleware();

    const composeEnhancer =
        (process.env.NODE_ENV !== 'production' &&
        global.window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
        compose;

    const store: Store<AppState> = createStore(
        reducers,
        initialState,
        composeEnhancer(applyMiddleware(sagaMiddleware, routerMiddleware(history)))
    );

    const saga: Saga = getSagas(store, [
        FooSaga
    ]);

    sagaMiddleware.run(saga);

    return store;
}
