import { takeEvery, put, call, take } from 'redux-saga/effects';
import { eventChannel, END }          from 'redux-saga';
import { SagaIterator }               from '@redux-saga/types';
import { LocationActionTypes }        from './types';
import { ISetLocation, SetLocation } from './actions';
import { City, Coordinates }         from '@common/global';
import { Plugins }                   from '@capacitor/core';
import { SetupActionTypes }           from '@frontend/core/lib/redux/ducks/setup';

const { Geolocation } = Plugins;

function* recoverStoredLocation(): SagaIterator {
    const location = localStorage.getItem('location');

    if (location !== null) {
        yield put(SetLocation(JSON.parse(location)));
    }
}

function storeLocation(action: ISetLocation): void {
    localStorage.setItem('location', JSON.stringify(action.location));
}

function getLocationFromBrowser() {
    return eventChannel((emitter: any): (() => void) => {

        const fetchCity = async (lat: number, lon: number): Promise<City> => {
            try {
                const res = await global.window.t721Sdk.geoloc.closestCity(null, {
                    lat,
                    lon
                })

                return res.data.city;
            } catch (e) {
                return null;
            }
        }

        const positionCb = (position: any): void => {
            const coords: Coordinates = {
                lon: position.coords.longitude,
                lat: position.coords.latitude,
            };

            fetchCity(coords.lat, coords.lon)
                .then((resultCity: City) => {

                    emitter(
                        SetLocation({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude,
                            city: resultCity,
                            online: false
                        }),
                    );

                    emitter(END);
                })
                .catch((e: Error) => {
                    console.error('cannot fetch city', e)
                });

        };

        const setFallbackCity = () => {
            const lat: number = 48.8656836;
            const lon: number = 2.3921184;

            fetchCity(lat, lon)
                .then((resultCity: City) => {

                    emitter(
                        SetLocation({
                            lat,
                            lon,
                            city: resultCity,
                            online: false
                        }),
                    );

                    emitter(END);
                })
                .catch((e: Error) => {
                    console.error('cannot fetch city', e)
                });
        };

        const positionErrorCb = (error: PositionError): void => {
            console.warn('Unable to recover position', error.message);

            setFallbackCity();
        };

        Geolocation.getCurrentPosition().then(positionCb).catch(positionErrorCb);

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
