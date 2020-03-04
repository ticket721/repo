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

export function configureStore(): Store<State> {
    // @ts-ignore
    const initialState: AppState = configureVtx<AppState>(getInitialState<AppState>(InitialAppState), {
        confirmation_threshold: 2,
        poll_timer: 300
    });

    const reducers: Reducer<AppState> = getReducers({
        foo: FooReducer
    });

    const sagaMiddleware = createSagaMiddleware();

    const composeEnhancer =
        (process.env.NODE_ENV !== 'production' &&
        global.window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
        compose;

    const store: Store<AppState> = createStore(
        reducers,
        initialState,
        composeEnhancer(applyMiddleware(sagaMiddleware))
    );

    const saga: Saga = getSagas(store, [
        FooSaga
    ]);

    sagaMiddleware.run(saga);

    return store;
}
