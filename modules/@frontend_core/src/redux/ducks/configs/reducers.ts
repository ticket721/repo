import { ConfigsAction, ISetEthConfig } from './actions';
import { ConfigsActionTypes, ConfigsState }           from './types';
import { Reducer }                          from 'redux';

export const configsInitialState: ConfigsState = {
    eth: {
        ethereumEndpointUrl: null,
        ethereumNetworkId: null,
        ethereumNetworkGenesisHash: null
    }
};

const SetEthConfigReducer: Reducer<ConfigsState, ISetEthConfig> =
    (state: ConfigsState, action: ISetEthConfig): ConfigsState => ({
        ...state,
        eth: {
            ethereumEndpointUrl: action.ethereumEndpointUrl,
            ethereumNetworkId: action.ethereumNetworkId,
            ethereumNetworkGenesisHash: action.ethereumNetworkGenesisHash
        }
    });

export const ConfigsReducer: Reducer<ConfigsState, ConfigsAction> =
    (state: ConfigsState = configsInitialState, action: ConfigsAction): ConfigsState => {
        switch (action.type) {
            case ConfigsActionTypes.SetEthConfig:
                return SetEthConfigReducer(state, action as ISetEthConfig);
            default:
                return state;
        }
    };
