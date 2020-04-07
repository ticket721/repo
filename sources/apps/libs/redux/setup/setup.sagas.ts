import { SagaIterator }            from 'redux-saga';
import { call, select, takeEvery } from 'redux-saga/effects';
import { IStart, SetupActions }    from './setup.actions';
import { AppState }                from '../states/app.state';

function* startSaga(action: IStart): SagaIterator {

    const state: AppState = yield select();

    const web3 = new Web3(new Web3.providers.HttpProvider(state.configs.ethereum_endpoint_url));

    yield put(VtxconfigSetWeb3(web3));

    yield put(VtxconfigSetAllowedNet(state.configs.ethereum_network_id, state.configs.ethereum_network_genesis_hash));

    yield put(VtxconfigReset());
}

function* getDevice(): Generator<SagaIterator> {
    const deviceInfos = deviceDetect();

    yield put(SetDeviceInfos(
        deviceInfos.device,
        deviceInfos.browser,
    ));
}

export function* SetupSaga(): SagaIterator {
    yield takeEvery(SetupActions.Start, startSaga);
}
