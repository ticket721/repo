import { createStore, applyMiddleware, Store, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { all, AllEffect, fork } from 'redux-saga/effects';
import '../utils/window';
import { entryPoint } from './entryPoint';
import { routerMiddleware } from 'connected-react-router';
import { AdditionalReducer, AppState, initialState, rootReducer } from './ducks';
import { userPropertiesSaga } from './ducks/user_properties/sagas';
import { setupSaga } from './ducks/setup/sagas';
import { history } from './ducks';
import { cacheSaga } from './ducks/cache/sagas';
import { authSaga } from './ducks/auth/sagas';
import { Saga } from '@redux-saga/types';
import { getEnv } from '../utils/getEnv';
import { featureFlagsSaga } from './ducks/feature-flags';

const sagaMiddleware = createSagaMiddleware();

export const configureStore = <AdditionalState>(
    additionalReducer?: AdditionalReducer<AdditionalState>,
    additionalInitState?: AdditionalState,
    additionalSagas?: Saga[],
): Store<AppState & AdditionalState> => {
    const composeEnhancer =
        (getEnv().NODE_ENV !== 'production' && global.window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

    const middlewares = applyMiddleware(sagaMiddleware, routerMiddleware(history));

    const store: Store<AppState & AdditionalState> = createStore(
        rootReducer<AdditionalState>(additionalReducer),
        initialState<AdditionalState>(additionalInitState),
        composeEnhancer(middlewares),
    );

    if (!additionalSagas) {
        additionalSagas = [];
    }

    const rootSaga = function* (): IterableIterator<AllEffect<any>> {
        yield all(
            [
                userPropertiesSaga,
                setupSaga,
                cacheSaga,
                authSaga,
                featureFlagsSaga,
                ...additionalSagas,
            ].map((saga: Saga) => fork(saga)),
        );
    };

    sagaMiddleware.run(rootSaga);

    entryPoint(store);

    return store;
};
