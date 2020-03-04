import { Action } from 'redux';

export const AuthenticationActions = {
    Register: '@@authentication/register',
    Login: '@@authentication/login',

};

export interface IRegister extends Action<string> {
    displayName: string;
    email: string;
    password: string;
}
