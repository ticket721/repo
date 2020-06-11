import { Action } from 'redux';
import { CacheActionTypes } from '../types';

export interface IRegisterEntity extends Action<string> {
    type: CacheActionTypes.RegisterEntity;
    method: string;
    args: any;
    uid: string;
    rate: number;
}

export const RegisterEntity = (method: string, args: any, uid: string, rate: number): IRegisterEntity => ({
    type: CacheActionTypes.RegisterEntity,
    method,
    args,
    uid,
    rate,
});

export interface IUnregisterEntity extends Action<string> {
    type: CacheActionTypes.UnregisterEntity;
    key: string;
    uid: string;
}

export const UnregisterEntity = (key: string, uid: string): IUnregisterEntity => ({
    type: CacheActionTypes.UnregisterEntity,
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

export type CachePropertiesAction = IRegisterEntity & IUnregisterEntity & IUpdateLastResponse;
