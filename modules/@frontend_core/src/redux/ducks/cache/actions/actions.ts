import { CacheActionTypes } from '../types';
import { Action } from 'redux';
import { CachePropertiesAction } from './properties.actions';
import { CacheSettingsAction } from './settings.actions';

export interface IFetchItem extends Action<string> {
    type: CacheActionTypes.FetchItem;
    key: string;
    method: string;
    args: any[];
}

export const FetchItem = (key: string, method: string, args: any[]): IFetchItem => ({
    type: CacheActionTypes.FetchItem,
    key,
    method,
    args,
});

export interface IManualFetchItem extends Action<string> {
    type: CacheActionTypes.ManualFetchItem;
    key: string;
    method: string;
    args: any[];
    score: number;
}

export const ManualFetchItem = (key: string, method: string, args: any[], score: number): IManualFetchItem => ({
    type: CacheActionTypes.ManualFetchItem,
    key,
    method,
    args,
    score,
});

export interface IUpdateItemData extends Action<string> {
    type: CacheActionTypes.UpdateItemData;
    key: string;
    data: any;
}

export const UpdateItemData = (key: string, data: any): IUpdateItemData => ({
    type: CacheActionTypes.UpdateItemData,
    key,
    data,
});

export interface IUpdateItemError extends Action<string> {
    type: CacheActionTypes.UpdateItemError;
    key: string;
    error: Error;
}

export const UpdateItemError = (key: string, error: Error): IUpdateItemError => ({
    type: CacheActionTypes.UpdateItemError,
    key,
    error,
});

export interface IStartRefreshInterval extends Action<string> {
    type: CacheActionTypes.StartRefreshInterval;
}

export const StartRefreshInterval = (): IStartRefreshInterval => ({
    type: CacheActionTypes.StartRefreshInterval,
});

export type CacheAction = IFetchItem &
    IManualFetchItem &
    IUpdateItemData &
    IUpdateItemError &
    IStartRefreshInterval &
    CachePropertiesAction &
    CacheSettingsAction;
