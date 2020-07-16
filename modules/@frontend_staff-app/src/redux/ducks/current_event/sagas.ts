import { SagaIterator }               from '@redux-saga/types';
import { takeEvery, put }                        from 'redux-saga/effects';
import { CurrentEventTypes }  from './types';
import { SetDate, SetEventId } from './actions';

function* setupDateSaga(): SagaIterator {
    const currentEvent = localStorage.getItem('currentEvent');
    const currentDateId = localStorage.getItem('currentDateId');
    const currentDateName = localStorage.getItem('currentDateName');
    if (currentEvent) {
        yield put(SetEventId(currentEvent));
    } else {
        yield put(SetEventId('none'));
    }

    if (currentDateId && currentDateName) {
        yield put(SetDate(currentDateId, currentDateName));
    } else {
        yield put(SetDate('none', ''));
    }
}

export function* currentEventSaga(): SagaIterator {
    yield takeEvery(CurrentEventTypes.SetupDate, setupDateSaga);
}
