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
    online_status: OnlineStatus;
    app_status: AppStatus;
}

export const InitialStatusesState: StatusesState = {
    online_status: OnlineStatus.Undeterminded,
    app_status: AppStatus.Loading
};
