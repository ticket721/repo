import { SagaIterator } from 'redux-saga';
import { call, takeEvery }     from 'redux-saga/effects';
import { FooActions, ISetFoo } from '../actions/foo.actions';

function* setFooSaga(action: ISetFoo): SagaIterator {
    try {
        yield call(setTimeout, () => true, 1000);
    } catch (e) {
        throw e;
    }
}

export function* FooSaga(): SagaIterator {
    yield takeEvery(FooActions.SetFooAction, setFooSaga);
}
