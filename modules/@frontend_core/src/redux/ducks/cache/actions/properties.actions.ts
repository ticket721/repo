import { Action }           from 'redux';
import { CacheActionTypes } from '../types';

export interface IRegisterComponent extends Action<string> {
    type: CacheActionTypes.RegisterComponent;
    key: string;
    method: string;
    args: any;
    uid: string;
    rate: number;
}

export const RegisterComponent = (key: string, method: string, args: any, uid: string, rate: number): IRegisterComponent => ({
    type: CacheActionTypes.RegisterComponent,
    key,
    method,
    args,
    uid,
    rate,
});

export interface IUnregisterComponent extends Action<string> {
    type: CacheActionTypes.UnregisterComponent;
    key: string;
    uid: string;
}

export const UnregisterComponent = (key: string, uid: string): IUnregisterComponent => ({
    type: CacheActionTypes.UnregisterComponent,
    key,
    uid,
});

export interface IUpdateLastResponse extends Action<string> {
    type: CacheActionTypes.UpdateLastResponse;
    key: string;
}

export const UpdateLastResponse = (key: string): IUpdateLastResponse => ({
    type: CacheActionTypes.UpdateLastResponse,
    key,
});

export type CachePropertiesAction =
    & IRegisterComponent
    & IUnregisterComponent
    & IUpdateLastResponse;
