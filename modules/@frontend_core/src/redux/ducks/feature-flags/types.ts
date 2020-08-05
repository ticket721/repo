export enum FeatureFlagsActionTypes {
    SetFeatureFlags = '@@feature-flags/setfeatureflags',
}

export interface Flag {
    active: boolean;
}

export interface FeatureFlagsState {
    [key: string]: Flag;
}
