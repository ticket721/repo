import { takeEvery, put, call, take } from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga';
import { SetupActionTypes } from '../setup/types';
import { SagaIterator } from '@redux-saga/types';
import { LocationActionTypes } from './types';
import { ISetLocation, SetLocation } from './actions';
import { closestCity, Coordinates } from '@common/global';

function* recoverStoredLocation(): SagaIterator {
    const location = localStorage.getItem('location');

    if (location !== null) {
        yield put(SetLocation(JSON.parse(location)));
        console.log('recovered location');
    }
}

function* storeLocation(action: ISetLocation): SagaIterator {
    localStorage.setItem('location', JSON.stringify(action.location));
}

function getLocationFromBrowser() {
    return eventChannel((emitter: any): (() => void) => {
        const positionCb = (position: any): void => {
            const coords: Coordinates = {
                lon: position.coords.longitude,
                lat: position.coords.latitude,
            };

            const city = closestCity(coords);

            emitter(
                SetLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    city,
                }),
            );

            emitter(END);
        };

        const setFallbackCity = () => {
            const lat: number = 48.8656836;
            const lon: number = 2.3921184;

            const city = closestCity({
                lat,
                lon,
            });

            emitter(
                SetLocation({
                    lat,
                    lon,
                    city,
                }),
            );

            emitter(END);
        };

        const positionErrorCb = (error: PositionError): void => {
            console.warn('Unable to recover position', error.message);

            setFallbackCity();
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(positionCb, positionErrorCb);
        } else {
            setFallbackCity();
        }

        return () => void 0;
    });
}

function* requestLocation(): SagaIterator {
    const chan = yield call(getLocationFromBrowser);
    try {
        while (true) {
            const setLocationAction = yield take(chan);
            yield put(setLocationAction);
        }
    } finally {
        //
    }
}

export function* locationSaga(): SagaIterator {
    yield takeEvery(SetupActionTypes.Start, recoverStoredLocation);
    yield takeEvery(LocationActionTypes.SetLocation, storeLocation);
    yield takeEvery(LocationActionTypes.GetLocation, requestLocation);
}
