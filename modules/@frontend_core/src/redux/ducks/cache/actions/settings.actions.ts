import { Action } from 'redux';
import { CacheActionTypes } from '../types';

export interface ISetTickInterval extends Action<string> {
    type: CacheActionTypes.SetTickInterval;
    tickInterval: number;
}

export const SetTickInterval = (tickInterval: number): ISetTickInterval => ({
    type: CacheActionTypes.SetTickInterval,
    tickInterval,
});

export interface ISetIntervalId extends Action<string> {
    type: CacheActionTypes.SetIntervalId;
    intervalId: number;
}

export const SetIntervalId = (intervalId: number): ISetIntervalId => ({
    type: CacheActionTypes.SetIntervalId,
    intervalId,
});

export type CacheSettingsAction = ISetTickInterval & ISetIntervalId;
