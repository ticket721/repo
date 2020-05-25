import { Action }                                     from 'redux';
import { NotificationKind, NotificationsActionTypes } from './types';

export interface IPushNotification extends Action<string> {
    type: NotificationsActionTypes.PushNotification;
    message: string;
    kind: NotificationKind;
    temporizer?: number;
}

export const PushNotification = (message: string, kind: NotificationKind, temporizer?: number): IPushNotification => ({
    type: NotificationsActionTypes.PushNotification,
    message,
    kind,
    temporizer,
});

export interface IPopNotification extends Action<string> {
    type: NotificationsActionTypes.PopNotification;
}

export const PopNotification = (): IPopNotification => ({
    type: NotificationsActionTypes.PopNotification,
});

export interface IToggleVisibility extends Action<string> {
    type: NotificationsActionTypes.ToggleVisibility;
    idx: number;
}

export const ToggleVisibility = (idx: number): IToggleVisibility => ({
    type: NotificationsActionTypes.ToggleVisibility,
    idx,
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
    & IToggleVisibility
    & IResetNotifications;
