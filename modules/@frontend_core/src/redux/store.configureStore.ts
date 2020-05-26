import { createStore, applyMiddleware, Store, compose } from 'redux';
import createSagaMiddleware                    from 'redux-saga';
import '../utils/window';
import { entryPoint }                          from './entryPoint';
import { getSagas }                            from 'ethvtx/lib';
import { routerMiddleware }                    from 'connected-react-router';
import { AppState, initialState, rootReducer } from './ducks';
import { userPropertiesSaga }                  from './ducks/user_properties/sagas';
import { setupSaga }                           from './ducks/setup/sagas';
import { history }                             from './ducks';
import { cacheSaga }                           from './ducks/cache/sagas';
import { authSaga }                            from './ducks/auth/sagas';

const sagaMiddleware = createSagaMiddleware();

export function configureStore(): Store<AppState> {
    const composeEnhancer =
        (process.env.NODE_ENV !== 'production' &&
            global.window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
        compose;

    const middlewares = applyMiddleware(sagaMiddleware, routerMiddleware(history));

    const store: Store<AppState> = createStore(rootReducer, initialState, composeEnhancer(middlewares));

    const rootSaga = getSagas(store, [
        userPropertiesSaga,
        setupSaga,
        cacheSaga,
        authSaga,
    ]);

    sagaMiddleware.run(rootSaga);

    entryPoint(store);

    return store;
}
