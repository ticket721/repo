import { SagaIterator } from '@redux-saga/types';
import { call, put, takeEvery } from 'redux-saga/effects';

import { IStart } from './actions';
import { GetCity, GetDevice } from '../user_properties';
import { SetupActionTypes } from './types';

import { StartRefreshInterval } from '../cache';
import { SetToken } from '../auth';
import { isExpired, isValidFormat, parseToken } from '../../../utils/token';
import { T721SDK } from '@common/sdk';
import { AppStatus, SetAppStatus } from '../statuses';
import { PushNotification } from '../notifications';
import { getEnv } from '../../../utils/getEnv';

function* startSaga(action: IStart): IterableIterator<any> {
    global.window.t721Sdk = new T721SDK();
    global.window.t721Sdk.connect(
        getEnv().REACT_APP_T721_SERVER_HOST,
        parseInt(getEnv().REACT_APP_T721_SERVER_PORT, 10),
        getEnv().REACT_APP_T721_SERVER_PROTOCOL as 'http' | 'https',
    );

    yield call(handleUser);
    yield put(GetDevice());
    yield put(GetCity());
    yield put(SetAppStatus(AppStatus.Ready));
    yield put(StartRefreshInterval());

    console.log('Serving App From', window.location.href);
}

function* handleUser(): IterableIterator<any> {
    if (localStorage.getItem('token')) {
        const token = parseToken(localStorage.getItem('token'));
        if (isValidFormat(token) && !isExpired(token)) {
            yield put(SetToken(token));
        } else {
            localStorage.removeItem('token');
            if (isExpired(token)) {
                yield put(PushNotification('session_expired', 'warning'));
                yield put(SetToken(null));
            }
        }
    } else {
        yield put(SetToken(null));
    }
}

export function* setupSaga(): SagaIterator {
    yield takeEvery(SetupActionTypes.Start, startSaga);
}
