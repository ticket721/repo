import { SagaIterator } from '@redux-saga/types';
import { call, put, takeEvery } from 'redux-saga/effects';

import { IStart } from './actions';
import { GetCity, GetDevice } from '../user_properties';
import { SetupActionTypes } from './types';

import { StartRefreshInterval } from '../cache';
import { GetUser, SetToken } from '../auth';
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
}

function* handleUser(): IterableIterator<any> {
    if (localStorage.getItem('token')) {
        const token = parseToken(localStorage.getItem('token'));
        if (isValidFormat(token) && !isExpired(token)) {
            try {
                yield global.window.t721Sdk.users.me(token.value);
                yield put(SetToken(token));
                yield put(GetUser());
            } catch (e) {
                if (e.message === 'Network Error') {
                    yield put(PushNotification('cannot_reach_server', 'error'));
                } else {
                    const errorData = e.response.data;
                    if (errorData.statusCode === 401) {
                        localStorage.removeItem('token');
                        yield put(PushNotification('unauthorized_error', 'error'));
                    } else {
                        yield put(PushNotification('internal_server_error', 'error'));
                    }
                }
            }
        } else {
            localStorage.removeItem('token');
            if (isExpired(token)) {
                yield put(PushNotification('session_expired', 'warning'));
            }
        }
    }
}

export function* setupSaga(): SagaIterator {
    yield takeEvery(SetupActionTypes.Start, startSaga);
}
