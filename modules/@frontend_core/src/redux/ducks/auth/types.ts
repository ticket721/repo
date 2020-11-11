export enum AuthActionTypes {
    LocalRegister = '@@auth/localregister',
    LocalLogin = '@@auth/locallogin',
    Logout = '@@auth/logout',
    SetToken = '@@auth/settoken',
    SetErrors = '@@auth/seterrors',
    ResetErrors = '@@auth/reseterrors',
    SetLoading = '@@auth/setloading',
    ResetSubmission = '@@auth/resetsubmission',
}

export interface Token {
    value: string;
    expiration: Date;
}

export interface AuthErrors {
    [key: string]: string;
}

export interface AuthState {
    token: Token;
    errors: AuthErrors;
    loading: boolean;
    submit: boolean;
}
