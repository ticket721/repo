import { SagaIterator }                                                                    from '@redux-saga/types';
import { takeEvery, put, select, call, take, cancel }                                      from 'redux-saga/effects';
import { DeviceWalletState, DeviceWalletTypes }                                            from './types';
import { IStartRegenInterval, NextGen, PushLastItem, SetPk, SetRegenInterval, SetSeconds } from './actions';
import { createWallet, loadWallet }                                                        from '@common/global';
import { T721AppState }                                                                    from '../../index';
import { eventChannel }                                                               from 'redux-saga';
import { SetupActionTypes }                                                                from '@frontend/core/lib/redux/ducks/setup';
import { Wallet }                                                                          from 'ethers';

const getDeviceWalletState = (state: T721AppState): DeviceWalletState => state.deviceWallet;

function* getPk(): SagaIterator {
    let wallet: Wallet;
    if (!localStorage.getItem('deviceWalletPk')) {
        wallet = yield call(createWallet);
        localStorage.setItem('deviceWalletPk', wallet.privateKey);
    } else {
        wallet = yield call(loadWallet, localStorage.getItem('deviceWalletPk'));
    }

    localStorage.setItem('deviceAddress', wallet.address);
    yield put(SetPk(localStorage.getItem('deviceWalletPk')));
}

function* startRegenSignatureInterval(action: IStartRegenInterval): SagaIterator {
    let deviceWalletState: DeviceWalletState = yield select(getDeviceWalletState);

    const wallet = yield call(loadWallet, deviceWalletState.pk);
    let initialSig: string;

    for (let i = 0; i < deviceWalletState.sigCount; i++) {
        const timestamp = new Date(Date.now() + 5000 * i).getTime();
        initialSig = yield call(
            wallet.signMessage.bind(wallet),
            deviceWalletState.currentTicketId + timestamp);
        yield put(PushLastItem(initialSig, timestamp));
    }

    const chan = yield call(regenSignatureChannel, deviceWalletState.seconds);

    while (true) {
        const { intervalId, seconds }: { intervalId: number, seconds: number } = yield take(chan);

        deviceWalletState = yield select(getDeviceWalletState);

        if (!deviceWalletState.currentTicketId) {
            yield cancel();
            chan.close();
        }

        if (deviceWalletState.seconds === 0) {
            yield put(SetSeconds(5));
        } else {
            yield put(SetSeconds(deviceWalletState.seconds - 1));
        }

        if (deviceWalletState.regenIntervalId !== intervalId) {
            yield put(SetRegenInterval(intervalId));
        }

        if (seconds === 0) {
            yield put(NextGen());

            const timestamp = new Date(Date.now() + 5000 * (deviceWalletState.sigCount - 1)).getTime();

            const sig = yield call(
                wallet.signMessage.bind(wallet),
                deviceWalletState.currentTicketId + timestamp);

            yield put(PushLastItem(sig, timestamp));
        }
    }
}

function regenSignatureChannel(seconds: number) {
    return eventChannel((emitter) => {
        const regenInterval: number = window.setInterval(() => {
            if (seconds === 0) {
                seconds = 5;
            } else {
                seconds -= 1;
            }
            emitter({ intervalId: regenInterval, seconds});
        }, 1000);

        return () => {
            clearInterval(regenInterval);
        };
    });
}

export function* deviceWalletSaga(): SagaIterator {
    yield takeEvery(SetupActionTypes.Start, getPk);
    yield takeEvery(DeviceWalletTypes.StartRegenInterval, startRegenSignatureInterval);
}
