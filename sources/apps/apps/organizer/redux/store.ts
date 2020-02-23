import { createStore, Store, applyMiddleware } from 'redux';
import reducers                                from './reducers';
import sagas                                   from './sagas';
import { AppState }                            from './state';
import createSagaMiddleware                    from 'redux-saga';

export const store = (): Store<AppState> => {
    const sagaMiddleware = createSagaMiddleware();
    const ret = createStore(reducers, applyMiddleware(sagaMiddleware));
    sagaMiddleware.run(sagas());
    return ret;
};