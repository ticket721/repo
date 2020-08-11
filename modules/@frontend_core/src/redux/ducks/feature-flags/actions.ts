import { FeatureFlagsActionTypes, Flag } from './types';
import { Action } from 'redux';

export interface ISetFeatureFlags extends Action<string> {
    type: FeatureFlagsActionTypes.SetFeatureFlags;
    flags: { [key: string]: Flag };
}

export const SetFeatureFlags = (flags: { [key: string]: Flag }): ISetFeatureFlags => ({
    type: FeatureFlagsActionTypes.SetFeatureFlags,
    flags,
});

export type FeatureFlagsAction = ISetFeatureFlags;
