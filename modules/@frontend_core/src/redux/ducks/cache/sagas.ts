import { SagaIterator } from '@redux-saga/types';
import { put, select, takeEvery, call, take } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import { CacheActionTypes, CacheState } from './types';
import { AppState } from '../index';
import { CacheCore } from '../../../cores/cache/CacheCore';
import { FetchItem, IFetchItem, UpdateItemData, UpdateItemError } from './actions/actions';
import { IRegisterEntity, UpdateLastResponse } from './actions/properties.actions';
import { SetIntervalId } from './actions/settings.actions';
import { AxiosResponse } from 'axios';

const getCacheState = (state: AppState): CacheState => state.cache;

function* checkItem(action: IRegisterEntity): IterableIterator<any> {
    const cacheState: CacheState = yield select(getCacheState);
    const key: string = CacheCore.key(action.method, action.args);

    if (CacheCore.shouldFetch(cacheState, key)) {
        yield put(FetchItem(key, action.method, action.args));
    }
}

function* fetchItem(action: IFetchItem): IterableIterator<any> {
    try {
        const data: AxiosResponse = yield CacheCore.fetchItem(action.method, action.args);

        yield put(UpdateItemData(action.key, data.data));
    } catch (e) {
        yield put(UpdateItemError(action.key, e));
    }

    yield put(UpdateLastResponse(action.key));
}

function* startRefreshInterval(): IterableIterator<any> {
    let cacheState: CacheState = yield select(getCacheState);

    const chan = yield call(refreshChannel, cacheState);

    while (true) {
        const intervalId: number = yield take(chan);

        cacheState = yield select(getCacheState);

        if (intervalId !== cacheState.settings.intervalId) {
            yield put(SetIntervalId(intervalId));
        }

        for (const [key, props] of Object.entries(cacheState.properties)) {
            if (CacheCore.shouldFetch(cacheState, key)) {
                yield put(FetchItem(key, props.method, props.args));
            }
        }
    }
}

function refreshChannel(cache: CacheState) {
    return eventChannel((emitter) => {
        const refreshInterval: number = window.setInterval(() => {
            emitter(refreshInterval);
        }, cache.settings.tickInterval);

        return () => {
            clearInterval(refreshInterval);
        };
    });
}

export function* cacheSaga(): SagaIterator {
    yield takeEvery(CacheActionTypes.RegisterEntity, checkItem);
    yield takeEvery(CacheActionTypes.FetchItem, fetchItem);
    yield takeEvery(CacheActionTypes.ManualFetchItem, fetchItem);
    yield takeEvery(CacheActionTypes.StartRefreshInterval, startRefreshInterval);
}
