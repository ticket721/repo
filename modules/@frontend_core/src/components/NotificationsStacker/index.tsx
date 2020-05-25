import React  from 'react';
import {
  Notification
}                           from '@frontend/flib-react/lib/components';
import styled                from 'styled-components';
import { useTranslation }    from 'react-i18next';
import './locales';
import { NotificationItem, ToggleVisibility } from '../../redux/ducks/notifications';
import { AppState }                           from '../../redux/ducks';
import { connect }           from 'react-redux';
import { Dispatch }          from 'redux';

const StyledStacker = styled.div`
    position: fixed;
    top: 30px;
    left: calc(50% - 250px);
    width: 500px;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
`;

export interface NotificationsStackerRState {
    notifications: NotificationItem[];
}

export interface NotificationsStackerRDispatch {
    hide: (idx: number) => void;
}

export type NotificationsStackerMergedProps = NotificationsStackerRState & NotificationsStackerRDispatch;

const NotificationsStacker: React.FC<NotificationsStackerMergedProps> = (props: NotificationsStackerMergedProps) => {
    const { notifications, hide } = props;
    const [ t ] = useTranslation(['error_notifications', 'warning_notifications', 'success_notifications', 'info_notifications']);

    return (
        <StyledStacker>
            {
                notifications.map((notif: NotificationItem, idx: number) => {
                    return <Notification
                      key={notif.kind + '_' + idx}
                      message={t(notif.kind + '_notifications:' + notif.message)}
                      kind={notif.kind}
                      temporizer={notif.temporizer}
                      onCloseClick={() => hide(idx)}/>
                })
            }
        </StyledStacker>
    )
};

const mapStateToProps = (state: AppState): NotificationsStackerRState => {
    const filteredNotifications = state.notifications.list
        .filter((notif) => notif.active);

    return {
        notifications: filteredNotifications
            .slice(filteredNotifications.length < 4 ? 0 : filteredNotifications.length - 3)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): NotificationsStackerRDispatch => ({
    hide: (idx: number): void => void dispatch(ToggleVisibility(idx)),
});

export default connect(mapStateToProps, mapDispatchToProps)(NotificationsStacker);
