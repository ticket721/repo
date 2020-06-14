import {
    AuthAction,
    ILocalLogin,
    ILocalRegister,
    ILogout,
    IResetErrors,
    IResetSubmission,
    ISetErrors,
    ISetLoading,
    ISetToken,
    ISetUser,
} from './actions';
import { AuthActionTypes, AuthState } from './types';
import { Reducer } from 'redux';

export const authInitialState: AuthState = {
    token: null,
    user: null,
    errors: null,
    loading: false,
    submit: false,
};

const SetTokenReducer: Reducer<AuthState, ISetToken> = (state: AuthState, action: ISetToken): AuthState => ({
    ...state,
    token: action.token,
});

const SetUserReducer: Reducer<AuthState, ISetUser> = (state: AuthState, action: ISetUser): AuthState => ({
    ...state,
    user: {
        username: action.username,
        kind: action.kind,
        locale: action.locale,
        validated: action.validated,
        address: action.address,
        uuid: action.uuid,
    },
});

const LogoutReducer: Reducer<AuthState, ILogout> = (state: AuthState, action: ILogout): AuthState => ({
    token: null,
    user: null,
    errors: null,
    loading: false,
    submit: false,
});

const SetErrorsReducer: Reducer<AuthState, ISetErrors> = (state: AuthState, action: ISetErrors): AuthState => ({
    ...state,
    errors: action.errors,
});

const ResetErrorsReducer: Reducer<AuthState, IResetErrors> = (state: AuthState, action: IResetErrors): AuthState => ({
    ...state,
    errors: null,
});

const SetLoadingReducer: Reducer<AuthState, ISetLoading> = (state: AuthState, action: ISetLoading): AuthState => ({
    ...state,
    loading: action.value,
});

const SubmissionReducer: Reducer<AuthState, ILocalRegister | ILocalLogin> = (
    state: AuthState,
    action: ILocalRegister | ILocalLogin,
): AuthState => ({
    ...state,
    errors: null,
    submit: true,
});

const ResetSubmissionReducer: Reducer<AuthState, IResetSubmission> = (
    state: AuthState,
    action: IResetSubmission,
): AuthState => ({
    ...state,
    submit: false,
    errors: null,
});

export const AuthReducer: Reducer<AuthState, AuthAction> = (
    state: AuthState = authInitialState,
    action: AuthAction,
): AuthState => {
    switch (action.type) {
        case AuthActionTypes.SetToken:
            return SetTokenReducer(state, action as ISetToken);
        case AuthActionTypes.SetUser:
            return SetUserReducer(state, action as ISetUser);
        case AuthActionTypes.Logout:
            return LogoutReducer(state, action as ILogout);
        case AuthActionTypes.SetErrors:
            return SetErrorsReducer(state, action as ISetErrors);
        case AuthActionTypes.ResetErrors:
            return ResetErrorsReducer(state, action as IResetErrors);
        case AuthActionTypes.SetLoading:
            return SetLoadingReducer(state, action as ISetLoading);
        case AuthActionTypes.LocalRegister:
        case AuthActionTypes.LocalLogin:
            return SubmissionReducer(state, action as ILocalRegister | ILocalLogin);
        case AuthActionTypes.ResetSubmission:
            return ResetSubmissionReducer(state, action as IResetSubmission);
        default:
            return state;
    }
};
