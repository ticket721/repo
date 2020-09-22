import { SagaIterator } from '@redux-saga/types';
import { put, takeEvery } from 'redux-saga/effects';

import { SetFeatureFlags } from './actions';

import { AuthActionTypes, ISetToken } from '../auth';

function* fetchFlags(action: ISetToken): IterableIterator<any> {
    if (action.token?.value) {
        try {
            const flags = yield global.window.t721Sdk.featureFlags.fetch(action.token.value);

            yield put(SetFeatureFlags((flags as any).data.flags));
        } catch (e) {
            console.error(e);
            console.error('Unable to fetch Feature Flags');
        }
    }
}

export function* featureFlagsSaga(): SagaIterator {
    yield takeEvery(AuthActionTypes.SetToken, fetchFlags);
}
