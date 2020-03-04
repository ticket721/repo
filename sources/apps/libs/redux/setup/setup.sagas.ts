import { SagaIterator }            from 'redux-saga';
import { call, select, takeEvery } from 'redux-saga/effects';
import { IStart, SetupActions }    from './setup.actions';
import { AppState }                from '../states/app.state';

function* startSaga(action: IStart): SagaIterator {

    const state: AppState = yield select();

    try {
        yield call(setTimeout, () => true, 1000);
    } catch (e) {
        throw e;
    }
}

export function* SetupSaga(): SagaIterator {
    yield takeEvery(SetupActions.Start, startSaga);
}
