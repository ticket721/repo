export enum CacheActionTypes {

}

export interface EthConfig {
    ethereumEndpointUrl: string;
    ethereumNetworkId: number;
    ethereumNetworkGenesisHash: string;
}


export type CachedResp = Error | any;

export interface CacheSettings {
    intervalId: number;
    tickInterval: number;
}

export interface RefreshProperties {
    refreshRate: number;
    lastFetch: number;
    shouldFetch: boolean;
    lastResp: number;
    method: string;
    args: any;
}

export interface Cache {
    requests: {
        [key: string]: CachedResp
    },
    settings: CacheSettings,
    refresh: {
        [key: string]: RefreshProperties
    },
}
