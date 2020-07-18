import { SagaIterator }               from '@redux-saga/types';
import { takeEvery, put }                        from 'redux-saga/effects';
import { CurrentEventTypes }                                    from './types';
import { ISetDate, SetDate, SetEventId, SetFilteredCategories } from './actions';

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

        const filteredCategories = localStorage.getItem(`date:${currentDateId}/filteredCategories`);

        if (filteredCategories) {
            yield put(SetFilteredCategories(JSON.parse(filteredCategories)));
        }
    } else {
        yield put(SetDate('none', ''));
    }
}

function* setDateSaga(action: ISetDate): SagaIterator {
    const filteredCategories = localStorage.getItem(`date:${action.dateId}/filteredCategories`);

    if (filteredCategories) {
        yield put(SetFilteredCategories(JSON.parse(filteredCategories)));
    } else {
        yield put(SetFilteredCategories([]));
    }
}

export function* currentEventSaga(): SagaIterator {
    yield takeEvery(CurrentEventTypes.SetupDate, setupDateSaga);
    yield takeEvery(CurrentEventTypes.SetDate, setDateSaga);
}
