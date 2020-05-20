import { SagaIterator }                                                                from '@redux-saga/types';
import { takeEvery, put, select }                                                      from 'redux-saga/effects';
import { AuthActionTypes, AuthState, Token }                                           from './types';
import { IGetUser, ILocalRegister, ILogout, SetErrors, SetLoading, SetToken, SetUser } from './actions';
import { LocalRegisterResponseDto }                                                    from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/LocalRegisterResponse.dto';
import { LocalLoginResponseDto }                                                       from '@common/sdk/lib/@backend_nest/apps/server/src/authentication/dto/LocalLoginResponse.dto';
import { UsersMeResponseDto }                                                          from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/users/dto/UsersMeResponse.dto';
import { AxiosResponse }                                                               from 'axios';
import { AppState }                                                                    from '../index';

const getAuthState = (state: AppState): AuthState => state.auth;

function* localRegister(action: ILocalRegister): IterableIterator<any> {
    yield put(SetLoading(true));

    try {
        const registerResponse: AxiosResponse = yield global.window.t721Sdk.localRegister(
            action.email,
            action.password,
            action.username,
            action.locale,
        );

        if (registerResponse['report']) {
            yield put(SetErrors({ password: 'Password is too weak' }));
        } else {
            const registerData: LocalRegisterResponseDto = registerResponse.data;
            const token: Token = {
                value: registerData.token,
                expiration: new Date(registerData.expiration)
            };

            localStorage.setItem('token', JSON.stringify(token));
            yield put(SetToken(token));
            yield put(SetUser(
                registerData.user.username,
                registerData.user.type,
                registerData.user.locale,
                registerData.user.valid,
            ));

            if (process.env.REACT_APP_ENV === 'dev') {
                const validateEmail = yield global.window.t721Sdk.validateEmail(registerData.validationToken);
                console.log(validateEmail);
            }
        }
    } catch (e) {
        const errorData = e.response.data;
        if (errorData.statusCode === 409) {
            switch (errorData.message) {
                case 'email_already_in_use':
                    yield put(SetErrors({ email: 'this email is already in use' }));
                    break;
                case 'username_already_in_use':
                    yield put(SetErrors({ username: 'this username is already in use' }));
                    break;
                case 'address_already_in_use':
                    yield put(SetErrors({ email: 'this address is already in use' }));
                    break;
            }
        } else {
            yield put(SetErrors({ global: 'Internal Server Error' }));
        }
    }

    yield put(SetLoading(false));
}

function* localLogin(action: ILocalRegister): IterableIterator<any> {
    yield put(SetLoading(true));

    try {
        const loginResponse: AxiosResponse = yield global.window.t721Sdk.localLogin(
            action.email,
            action.password,
        );

        const loginData: LocalLoginResponseDto = loginResponse.data;

        const token: Token = {
            value: loginData.token,
            expiration: new Date(loginData.expiration)
        };

        localStorage.setItem('token', JSON.stringify(token));

        yield put(SetToken(token));

        yield put(SetUser(
            loginData.user.username,
            loginData.user.type,
            loginData.user.locale,
            loginData.user.valid,
        ));
    } catch (e) {
        const errorData = e.response.data;
        if (errorData.message === 'invalid_credentials') {
            yield put(SetErrors({ email: ' ', password: ' ', global: 'wrong email or password' }));
        } else {
            yield put(SetErrors({ global: 'Internal Server Error' }));
        }
    }

    yield put(SetLoading(false));
}

function* logout(action: ILogout): IterableIterator<any> {
    localStorage.removeItem('token');
}

function* getUser(action: IGetUser): IterableIterator<any> {
    const authState: AuthState = yield select(getAuthState);

    try {
        const userResponse: AxiosResponse = yield global.window.t721Sdk.users.me(
            authState.token.value
        );

        const userData: UsersMeResponseDto = userResponse.data;

        yield put(SetUser(
            userData.user.username,
            userData.user.type,
            userData.user.locale,
            userData.user.valid,
        ));
    } catch (e) {
        console.log(e);
    }
}

export function* authSaga(): SagaIterator {
    yield takeEvery(AuthActionTypes.LocalRegister, localRegister);
    yield takeEvery(AuthActionTypes.LocalLogin, localLogin);
    yield takeEvery(AuthActionTypes.Logout, logout);
    yield takeEvery(AuthActionTypes.GetUser, getUser);
}
