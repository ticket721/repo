export enum StatusesActionTypes {
    ToggleOnlineStatus = '@@statuses/TOGGLE_ONLINE_STATUS',
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
