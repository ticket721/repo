export enum ConfigsActionTypes {
    SetEthConfig = '@@configs/setethconfig',
}

export interface EthConfig {
    ethereumEndpointUrl: string;
    ethereumNetworkId: number;
    ethereumNetworkGenesisHash: string;
}

export interface ConfigsState {
    eth: EthConfig
}
