export enum NotificationsActionTypes {
    PushNotification = '@@notifications/pushnotification',
    PopNotification = '@@notifications/popnotification',
    ResetNotifications = '@@notifications/resetnotifications',
}

export type NotificationKind = 'error' | 'warning' | 'success' | 'info';

export interface NotificationItem {
    message: string;
    kind: NotificationKind;
}

export interface NotificationsState {
    list: NotificationItem[];
    active: boolean;
}
