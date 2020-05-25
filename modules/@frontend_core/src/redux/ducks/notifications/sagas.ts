import { SagaIterator }                                 from '@redux-saga/types';
import { takeEvery, put, select, delay }                       from 'redux-saga/effects';
import { AppState }                                     from '../index';
import { NotificationsActionTypes, NotificationsState } from './types';
import { IPushNotification, ToggleVisibility } from './actions';

const getNotificationsState = (state: AppState): NotificationsState => state.notifications;

function* startTemporizer(action: IPushNotification): IterableIterator<any> {
    const notificationsState: NotificationsState = yield select(getNotificationsState);
    const notifIdx: number = notificationsState.list.length - 1;
    if (action.temporizer) {
        yield delay(action.temporizer);
        if (notificationsState.list[notifIdx].active) {
            yield put(ToggleVisibility(notifIdx));
        }
    }
}

export function* notificationsSaga(): SagaIterator {
    yield takeEvery(NotificationsActionTypes.PushNotification, startTemporizer);
}
