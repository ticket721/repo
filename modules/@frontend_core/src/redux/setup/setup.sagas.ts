import { SagaIterator }         from '@redux-saga/types';
import { call, select, takeEvery, put }         from 'redux-saga/effects';

import Web3                                                         from 'web3';
import { VtxconfigReset, VtxconfigSetAllowedNet, VtxconfigSetWeb3 } from 'ethvtx/lib/vtxconfig/actions/actions';

const deviceDetect = require('device-detect');

import { IStart, IStartVtx, SetDeviceInfos, SetupActions } from './setup.actions';
import { AppState }                                        from '../store';

function* startSaga(action: IStart): SagaIterator {

    // const state: AppState = yield select();

    yield call(getDevice);
}

function* startVtxSaga(action: IStartVtx): SagaIterator {

    const state: AppState = yield select();

    const web3 = new Web3(new Web3.providers.HttpProvider(state.configs.ethereum_endpoint_url));

    yield put(VtxconfigSetWeb3(web3));

    yield put(VtxconfigSetAllowedNet(state.configs.ethereum_network_id, state.configs.ethereum_network_genesis_hash));

    yield put(VtxconfigReset());
}

function* getDevice(): SagaIterator {
    const deviceInfos = deviceDetect();

    yield put(SetDeviceInfos(
        deviceInfos.device,
        deviceInfos.browser,
    ));
}

export function* SetupSaga(): SagaIterator {
    yield takeEvery(SetupActions.Start, startSaga);
    yield takeEvery(SetupActions.StartVtx, startVtxSaga);
}
