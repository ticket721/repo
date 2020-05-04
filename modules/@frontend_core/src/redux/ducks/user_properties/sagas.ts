import { SagaIterator }         from '@redux-saga/types';
import { takeEvery, put }         from 'redux-saga/effects';

// tslint:disable-next-line:no-var-requires
const deviceDetect = require('device-detect');

import { SetDeviceInfos }   from './actions';
import { UserPropertiesActionTypes } from './types';


function* getDevice(): SagaIterator {
    const deviceInfos = deviceDetect();

    console.log(deviceInfos);
    yield put(SetDeviceInfos(
        deviceInfos.device,
        deviceInfos.browser,
    ));
}

function* getCity(): SagaIterator {
    console.log();
}

export function* userPropertiesSaga(): SagaIterator {
    yield takeEvery(UserPropertiesActionTypes.GetDevice, getDevice);
    yield takeEvery(UserPropertiesActionTypes.GetCity, getCity);
}
