export enum CacheActionTypes {
    SetTickInterval = '@@cache/settickinterval',
    SetIntervalId = '@@cache/setintervalid',
    FetchItem = '@@cache/fetchitem',
    RegisterComponent = '@@cache/registercomponent',
    UnregisterComponent = '@@cache/unregistercomponent',
    UpdateItemData = '@@cache/updateitemdata',
    UpdateItemError = '@@cache/updateitemerror',
    UpdateLastResponse = '@@cache/updatelastresponse',
    StartRefreshInterval = '@@cache/startrefreshinterval',
}

export interface CacheSettings {
    intervalId: number;
    tickInterval: number;
    startTimestamp: number;
}

export interface CachedItemProperties {
    lastFetch: number;
    lastResp: number;
    requestedBy: Array<string>;
    refreshRates: Array<number>;
    method: string;
    args: any;
}

export interface CachedItem {
    data: any;
    error: Error;
}

export interface CacheState {
    settings: CacheSettings;
    items: {
        [key: string]: CachedItem;
    },
    properties: {
        [key: string]: CachedItemProperties;
    }
}
