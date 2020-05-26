export enum AuthActionTypes {
    LocalRegister = '@@auth/localregister',
    LocalLogin = '@@auth/locallogin',
    Logout = '@@auth/logout',
    SetToken = '@@auth/settoken',
    SetUser = '@@auth/setuser',
    GetUser = '@@auth/getuser',
    SetErrors = '@@auth/seterrors',
    ResetErrors = '@@auth/reseterrors',
    SetLoading = '@@auth/setloading',
    ResetSubmission = '@@auth/resetsubmission',
}

export interface User {
    username: string;
    kind: string;
    locale: string;
    validated: boolean;
}

export interface Token {
    value: string;
    expiration: Date;
}

export interface AuthErrors {
    [key: string]: string;
}

export interface AuthState {
    user: User
    token: Token;
    errors: AuthErrors;
    loading: boolean;
    submit: boolean;
}
