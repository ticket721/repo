import { createStore, applyMiddleware, Store, compose } from 'redux';
import createSagaMiddleware                                      from 'redux-saga';
import { State }                          from 'ethvtx/lib/state';
import { SpecificState, InitialAppState } from './states';
import '../utils/window';
import { SetupSaga }                                             from './setup/setup.sagas';
import { entryPoint }                                            from './entryPoint';
import { configureVtx, getInitialState, getReducers, getSagas } from 'ethvtx/lib';
import { SetupReducer }                                         from './setup';
import {createMemoryHistory}                                    from 'history';
import {connectRouter, routerMiddleware} from 'connected-react-router';

export type AppState = SpecificState & State;

export const history = createMemoryHistory();

export const initialState: AppState = configureVtx<AppState>(getInitialState<SpecificState>(InitialAppState) as AppState, {
    confirmation_threshold: 2,
    poll_timer: 300
});

export function configureStore(): Store<AppState> {

    const reducers = getReducers({
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

    const saga = getSagas(store, [
        SetupSaga,
    ]);

    sagaMiddleware.run(saga);

    entryPoint(store);

    return store;
}
