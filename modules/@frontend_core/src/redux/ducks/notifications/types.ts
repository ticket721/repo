export enum NotificationsActionTypes {
    PushNotification = '@@notifications/pushnotification',
    PopNotification = '@@notifications/popnotification',
    ToggleVisibility = '@@notifications/togglevisibility',
    ResetNotifications = '@@notifications/resetnotifications',
}

export type NotificationKind = 'error' | 'warning' | 'success' | 'info';

export interface NotificationItem {
    message: string;
    kind: NotificationKind;
    active: boolean;
    temporizer: number | undefined;
}

export interface NotificationsState {
    list: NotificationItem[];
    active: boolean;
}
