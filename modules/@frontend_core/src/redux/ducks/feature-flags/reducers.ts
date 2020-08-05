import { FeatureFlagsAction, ISetFeatureFlags } from './actions';
import { FeatureFlagsActionTypes, FeatureFlagsState } from './types';
import { Reducer } from 'redux';

export const featureFlagsInitialState: FeatureFlagsState = {};

const SetFeatureFlagsReducer: Reducer<FeatureFlagsState, ISetFeatureFlags> = (
    state: FeatureFlagsState,
    action: ISetFeatureFlags,
): FeatureFlagsState => ({
    ...state,
    ...action.flags,
});

export const FeatureFlagsReducer: Reducer<FeatureFlagsState, FeatureFlagsAction> = (
    state: FeatureFlagsState = featureFlagsInitialState,
    action: FeatureFlagsAction,
): FeatureFlagsState => {
    switch (action.type) {
        case FeatureFlagsActionTypes.SetFeatureFlags:
            return SetFeatureFlagsReducer(state, action as ISetFeatureFlags);
        default:
            return state;
    }
};
