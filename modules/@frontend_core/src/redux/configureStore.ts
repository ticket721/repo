import { createStore, applyMiddleware, Store, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import '../utils/window';
import { entryPoint } from './entryPoint';
import { getSagas } from 'ethvtx/lib';
import { routerMiddleware } from 'connected-react-router';
import { AdditionalReducer, AppState, initialState, rootReducer } from './ducks';
import { userPropertiesSaga } from './ducks/user_properties/sagas';
import { setupSaga } from './ducks/setup/sagas';
import { history } from './ducks';
import { cacheSaga } from './ducks/cache/sagas';
import { authSaga } from './ducks/auth/sagas';

import { Saga } from '@redux-saga/types';

export interface AdditionalStateTemplate {
    [key: string]: any;
}

const sagaMiddleware = createSagaMiddleware();

export const configureStore = <AdditionalState extends AdditionalStateTemplate>(
    additionalReducer?: AdditionalReducer<AdditionalState>,
    additionalInitState?: AdditionalState,
    additionalSagas?: Saga[],
): Store<AppState & AdditionalState> => {
    const composeEnhancer =
        (process.env.NODE_ENV !== 'production' && global.window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

    const middlewares = applyMiddleware(sagaMiddleware, routerMiddleware(history));

    const store: Store<AppState & AdditionalState> = createStore(
        rootReducer<AdditionalState>(additionalReducer),
        initialState<AdditionalState>(additionalInitState),
        composeEnhancer(middlewares),
    );

    const rootSaga = getSagas(store, [userPropertiesSaga, setupSaga, cacheSaga, authSaga, ...additionalSagas]);

    sagaMiddleware.run(rootSaga);

    entryPoint(store);

    return store;
};
