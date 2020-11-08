export enum CacheActionTypes {
    SetTickInterval = '@@cache/settickinterval',
    SetIntervalId = '@@cache/setintervalid',
    FetchItem = '@@cache/fetchitem',
    ManualFetchItem = `@@cache/manualfetchitem`,
    RegisterEntity = '@@cache/registerentity',
    UnregisterEntity = '@@cache/unregisterentity',
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
    score: number;
}

export interface CachedItem {
    data: any;
    error: Error;
    errors: number;
}

export interface CacheState {
    settings: CacheSettings;
    items: {
        [key: string]: CachedItem;
    };
    properties: {
        [key: string]: CachedItemProperties;
    };
}
