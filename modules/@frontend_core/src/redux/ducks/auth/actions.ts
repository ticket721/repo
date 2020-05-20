import { AuthActionTypes, AuthErrors, Token } from './types';
import { Action }                             from 'redux';

export interface ILocalRegister extends Action<string> {
    type: AuthActionTypes.LocalRegister;
    email: string;
    password: string;
    username: string;
    locale: string;
}

export const LocalRegister = (email: string, password: string, username: string, locale: string): ILocalRegister => ({
    type: AuthActionTypes.LocalRegister,
    email,
    password,
    username,
    locale
});

export interface ILocalLogin extends Action<string> {
    type: AuthActionTypes.LocalLogin;
    email: string;
    password: string;
}

export const LocalLogin = (email: string, password: string): ILocalLogin => ({
    type: AuthActionTypes.LocalLogin,
    email,
    password,
});

export interface ILogout extends Action<string> {
    type: AuthActionTypes.Logout;
}

export const Logout = (): ILogout => ({
    type: AuthActionTypes.Logout,
});

export interface ISetToken extends Action<string> {
    type: AuthActionTypes.SetToken;
    token: Token;
}

export const SetToken = (token: Token): ISetToken => ({
    type: AuthActionTypes.SetToken,
    token,
});

export interface ISetUser extends Action<string> {
    type: AuthActionTypes.SetUser;
    username: string;
    kind: string;
    locale: string;
    validated: boolean;
}

export const SetUser = (username: string, kind: string, locale: string, validated: boolean): ISetUser => ({
    type: AuthActionTypes.SetUser,
    username,
    kind,
    locale,
    validated,
});

export interface IGetUser extends Action<string> {
    type: AuthActionTypes.GetUser;
}

export const GetUser = (): IGetUser => ({
    type: AuthActionTypes.GetUser,
});

export interface ISetErrors extends Action<string> {
    type: AuthActionTypes.SetErrors;
    errors: AuthErrors;
}

export const SetErrors = (errors: AuthErrors): ISetErrors => ({
    type: AuthActionTypes.SetErrors,
    errors,
});

export interface IResetErrors extends Action<string> {
    type: AuthActionTypes.ResetErrors;
}

export const ResetErrors = (): IResetErrors => ({
    type: AuthActionTypes.ResetErrors,
});

export interface ISetLoading extends Action<string> {
    type: AuthActionTypes.SetLoading;
    value: boolean;
}

export const SetLoading = (value: boolean): ISetLoading => ({
    type: AuthActionTypes.SetLoading,
    value,
});

export interface IResetSubmission extends Action<string> {
    type: AuthActionTypes.ResetSubmission;
}

export const ResetSubmission = (): IResetSubmission => ({
    type: AuthActionTypes.ResetSubmission,
});

export type AuthAction =
    ILocalRegister
    & ILocalLogin
    & ILogout
    & ISetToken
    & ISetUser
    & IGetUser
    & ISetErrors
    & IResetErrors
    & ISetLoading
    & IResetSubmission;
