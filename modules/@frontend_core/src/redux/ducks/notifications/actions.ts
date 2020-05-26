import { Action }                                     from 'redux';
import { NotificationKind, NotificationsActionTypes } from './types';

export interface IPushNotification extends Action<string> {
    type: NotificationsActionTypes.PushNotification;
    message: string;
    kind: NotificationKind;
}

export const PushNotification = (message: string, kind: NotificationKind): IPushNotification => ({
    type: NotificationsActionTypes.PushNotification,
    message,
    kind,
});

export interface IPopNotification extends Action<string> {
    type: NotificationsActionTypes.PopNotification;
}

export const PopNotification = (): IPopNotification => ({
    type: NotificationsActionTypes.PopNotification,
});

export interface IResetNotifications extends Action<string> {
    type: NotificationsActionTypes.ResetNotifications;
}

export const ResetNotifications = (): IResetNotifications => ({
    type: NotificationsActionTypes.ResetNotifications,
});

export type NotificationsAction =
    IPushNotification
    & IPopNotification
    & IResetNotifications;
