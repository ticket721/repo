import { NotificationsState, NotificationItem, NotificationsActionTypes }                                       from './types';
import { IPopNotification, IPushNotification, IResetNotifications, IToggleVisibility, NotificationsAction } from './actions';
import { Reducer }                                                                                          from 'redux';

export const notificationsInitialState: NotificationsState = {
    list: [],
    active: false,
};

const PushNotificationReducer: Reducer<NotificationsState, IPushNotification> =
    (state: NotificationsState, action: IPushNotification): NotificationsState => ({
        active: true,
        list: [
            ...state.list,
            {
                message: action.message,
                kind: action.kind,
                active: true,
                temporizer: action.temporizer,
            }
        ],
    });

const PopNotificationReducer: Reducer<NotificationsState, IPopNotification> =
    (state: NotificationsState, action: IPopNotification): NotificationsState => ({
        active: state.list.findIndex(
            (notif: NotificationItem, idx: number) => notif.active && idx < state.list.length - 1) !== -1,
        list: state.list.filter((v, idx) => idx < state.list.length - 1),
    });

const ToggleVisibilityReducer: Reducer<NotificationsState, IToggleVisibility> =
    (state: NotificationsState, action: IToggleVisibility): NotificationsState => ({
        active: state.list.findIndex(
            (notif: NotificationItem, idx: number) => notif.active ?
                idx !== action.idx :
                idx === action.idx
        ) !== -1,
        list: state.list.map((notif: NotificationItem, idx: number) => idx === action.idx ?
            {
                ...notif,
                active: !notif.active,
            } :
            notif
        ),
    });

const ResetNotificationsReducer: Reducer<NotificationsState, IResetNotifications> =
    (state: NotificationsState, action: IResetNotifications): NotificationsState => ({
        list: [],
        active: false,
    });

export const NotificationsReducer: Reducer<NotificationsState, NotificationsAction> =
    (state: NotificationsState = notificationsInitialState, action: NotificationsAction): NotificationsState => {
        switch (action.type) {
            case NotificationsActionTypes.PushNotification:
                return PushNotificationReducer(state, action as IPushNotification);
            case NotificationsActionTypes.PopNotification:
                return PopNotificationReducer(state, action as IPopNotification);
            case NotificationsActionTypes.ToggleVisibility:
                return ToggleVisibilityReducer(state, action as IToggleVisibility);
            case NotificationsActionTypes.ResetNotifications:
                return ResetNotificationsReducer(state, action as IResetNotifications);
            default:
                return state;
        }
    };
