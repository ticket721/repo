import { ConfigsActionTypes } from './types';
import { Action }               from 'redux';

export interface ISetEthConfig extends Action<string> {
    type: ConfigsActionTypes.SetEthConfig;
    ethereumEndpointUrl: string;
    ethereumNetworkId: number;
    ethereumNetworkGenesisHash: string;
}

export const SetEthConfig = (ethereumEndpointUrl: string, ethereumNetworkId: number, ethereumNetworkGenesisHash: string): ISetEthConfig => ({
    type: ConfigsActionTypes.SetEthConfig,
    ethereumEndpointUrl,
    ethereumNetworkId,
    ethereumNetworkGenesisHash
});

export type ConfigsAction =
    ISetEthConfig;
