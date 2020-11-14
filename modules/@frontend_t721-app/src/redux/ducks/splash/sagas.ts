import { SagaIterator }       from '@redux-saga/types';
import { call, takeEvery }    from 'redux-saga/effects';
import { SetupActionTypes }   from '@frontend/core/lib/redux/ducks/setup';
import { Plugins, Capacitor } from '@capacitor/core';

const { SplashScreen } = Plugins;

function* hideSplash(): SagaIterator {
    if (Capacitor.isPluginAvailable('SplashScreen')) {
        yield call(SplashScreen.hide);
    }
}

export function* splashSaga(): SagaIterator {
    yield takeEvery(SetupActionTypes.Start, hideSplash);
}
