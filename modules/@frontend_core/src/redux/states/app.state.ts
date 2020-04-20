import { InitialPropertiesState, PropertiesState } from './properties.state';
import { InitialStatusesState, StatusesState } from './statuses.state';
import { ConfigsState, InitialConfigsState } from './configs.state';

export interface SpecificState {
    properties: PropertiesState;
    statuses: StatusesState;
    configs: ConfigsState;
};

export const InitialAppState: SpecificState = {
    properties: InitialPropertiesState,
    statuses: InitialStatusesState,
    configs: InitialConfigsState,
};
