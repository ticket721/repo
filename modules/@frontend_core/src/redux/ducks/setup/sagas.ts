import { AppState } from '../';
import { SagaIterator } from '@redux-saga/types';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import Web3 from 'web3';
import { VtxconfigReset, VtxconfigSetAllowedNet, VtxconfigSetWeb3 } from 'ethvtx/lib/vtxconfig/actions/actions';

import { IStart, IStartVtx } from './actions';
import { GetCity, GetDevice } from '../user_properties';
import { SetupActionTypes } from './types';

import { EthConfig } from '../configs';
import { StartRefreshInterval } from '../cache';
import { GetUser, SetToken } from '../auth';
import { isExpired, isValidFormat, parseToken } from '../../../utils/token';
import { T721SDK } from '@common/sdk';
import { AppStatus, SetAppStatus } from '../statuses';
import { PushNotification } from '../notifications';

function* startSaga(action: IStart): IterableIterator<any> {
    global.window.t721Sdk = new T721SDK();
    global.window.t721Sdk.connect(
        process.env.REACT_APP_T721_SERVER_HOST,
        parseInt(process.env.REACT_APP_T721_SERVER_PORT, 10),
        process.env.REACT_APP_T721_SERVER_PROTOCOL as 'http' | 'https',
    );

    yield call(handleUser);
    yield put(GetDevice());
    yield put(GetCity());
    yield put(SetAppStatus(AppStatus.Ready));
    yield put(StartRefreshInterval());
}

function* startVtxSaga(action: IStartVtx): IterableIterator<any> {
    const getEthConfig = (state: AppState) => state.configs.eth;

    const config: EthConfig = yield select(getEthConfig);

    const web3 = new Web3(new Web3.providers.HttpProvider(config.ethereumEndpointUrl));

    yield put(VtxconfigSetWeb3(web3));

    yield put(VtxconfigSetAllowedNet(config.ethereumNetworkId, config.ethereumNetworkGenesisHash));

    yield put(VtxconfigReset());
}

function* handleUser(): IterableIterator<any> {
    if (localStorage.getItem('token')) {
        const token = parseToken(localStorage.getItem('token'));
        console.log(token, isValidFormat(token) && !isExpired(token));
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
    yield takeEvery(SetupActionTypes.StartVtx, startVtxSaga);
}
