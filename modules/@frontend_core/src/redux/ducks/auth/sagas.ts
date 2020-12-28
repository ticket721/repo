import { SagaIterator } from '@redux-saga/types';
import { takeEvery, put } from 'redux-saga/effects';
import { AuthActionTypes, Token } from './types';
import { IGoogleLogin, ILocalRegister, ILogout, ISetToken, SetErrors, SetLoading, SetToken } from './actions';
import { LocalRegisterResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/LocalRegisterResponse.dto';
import { LocalLoginResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/LocalLoginResponse.dto';
import { AxiosResponse } from 'axios';
import { PushNotification } from '../notifications';
import { getEnv } from '../../../utils/getEnv';
import { googleLoginSdkCall } from '../../../oauth/google';

function* localRegister(action: ILocalRegister): IterableIterator<any> {
    yield put(SetLoading(true));

    try {
        const registerResponse: AxiosResponse = yield global.window.t721Sdk.localRegister(
            action.email,
            action.password,
            action.username,
            action.locale,
            `${getEnv().REACT_APP_SELF}/validate-email`,
        );

        const registerData: LocalRegisterResponseDto = registerResponse.data;
        const token: Token = {
            value: registerData.token,
            expiration: new Date(registerData.expiration),
        };

        yield put(SetToken(token));
        yield put(PushNotification('successfully_registered', 'success'));

        if (getEnv().REACT_APP_ENV === 'dev') {
            const validateEmail = yield global.window.t721Sdk.validateEmail(registerData.validationToken);
            console.log(validateEmail);
        }
    } catch (e) {
        if (e.message === 'Network Error') {
            yield put(PushNotification('cannot_reach_server', 'error'));
        } else {
            const errorData = e.response.data;
            if (errorData.statusCode === 409) {
                if (errorData.message === 'username_already_in_use') {
                    yield put(SetErrors({ username: errorData.message }));
                }

                if (errorData.message === 'email_already_in_use') {
                    yield put(SetErrors({ email: errorData.message }));
                }
            } else {
                yield put(PushNotification('internal_server_error', 'error'));
            }
        }
    }

    yield put(SetLoading(false));
}

function* localLogin(action: ILocalRegister): IterableIterator<any> {
    yield put(SetLoading(true));

    try {
        const loginResponse: AxiosResponse = yield global.window.t721Sdk.localLogin(action.email, action.password);

        const loginData: LocalLoginResponseDto = loginResponse.data;

        const token: Token = {
            value: loginData.token,
            expiration: new Date(loginData.expiration),
        };

        yield put(SetToken(token));
    } catch (e) {
        if (e.message === 'Network Error') {
            yield put(PushNotification('cannot_reach_server', 'error'));
        } else {
            const errorData = e.response.data;
            if (errorData.message === 'invalid_credentials') {
                yield put(PushNotification('invalid_credentials', 'error'));
                yield put(SetErrors({ email: ' ', password: ' ' }));
            } else {
                yield put(PushNotification('internal_server_error', 'error'));
            }
        }
    }

    yield put(SetLoading(false));
}

function* googleLogin(action: IGoogleLogin): IterableIterator<any> {
    yield put(SetLoading(true));

    try {
        const token = yield googleLoginSdkCall(action.idToken);
        yield put(SetToken(token));
    } catch (e) {
        yield put(PushNotification('invalid_google_credentials', 'error'));
        yield put(SetErrors({ google: 'invalid_google_credentials' }));
    }

    yield put(SetLoading(false));
}

function* logout(action: ILogout): IterableIterator<any> {
    localStorage.removeItem('token');
}

function* settoken(action: ISetToken): IterableIterator<any> {
    if (action.token) {
        localStorage.setItem('token', JSON.stringify(action.token));
    }
}

export function* authSaga(): SagaIterator {
    yield takeEvery(AuthActionTypes.LocalRegister, localRegister);
    yield takeEvery(AuthActionTypes.LocalLogin, localLogin);
    yield takeEvery(AuthActionTypes.GoogleLogin, googleLogin);
    yield takeEvery(AuthActionTypes.Logout, logout);
    yield takeEvery(AuthActionTypes.SetToken, settoken);
}
