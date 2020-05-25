export enum StatusesActionTypes {
    ToggleOnlineStatus = '@@statuses/toggleonlinestatus',
    SetAppStatus = '@@statuses/setappstatus',
}

export enum AppStatus {
    Loading,
    Ready
}

export enum OnlineStatus {
    Undeterminded,
    Online,
    Offline,
}

export interface StatusesState {
    onlineStatus: OnlineStatus;
    appStatus: AppStatus;
}
