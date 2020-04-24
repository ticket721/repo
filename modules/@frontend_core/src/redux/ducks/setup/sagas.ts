import { AppState }           from '../';
import { SagaIterator }         from '@redux-saga/types';
import { select, takeEvery, put }         from 'redux-saga/effects';

import Web3                                                         from 'web3';
import { VtxconfigReset, VtxconfigSetAllowedNet, VtxconfigSetWeb3 } from 'ethvtx/lib/vtxconfig/actions/actions';

import { IStart, IStartVtx }  from './actions';
import { GetCity, GetDevice } from '../user_properties';
import { SetupActionTypes }   from './types';

import { EthConfig } from '../configs';

function* startSaga(action: IStart): SagaIterator {
    yield put(GetDevice());
    yield put(GetCity());
}

function* startVtxSaga(action: IStartVtx): SagaIterator {
    const getEthConfig = (state: AppState) => state.configs.eth;

    const config: EthConfig = yield select(getEthConfig);

    const web3 = new Web3(new Web3.providers.HttpProvider(config.ethereumEndpointUrl));

    yield put(VtxconfigSetWeb3(web3));

    yield put(VtxconfigSetAllowedNet(config.ethereumNetworkId, config.ethereumNetworkGenesisHash));

    yield put(VtxconfigReset());
}

export function* setupSaga(): SagaIterator {
    yield takeEvery(SetupActionTypes.Start, startSaga);
    yield takeEvery(SetupActionTypes.StartVtx, startVtxSaga);
}
