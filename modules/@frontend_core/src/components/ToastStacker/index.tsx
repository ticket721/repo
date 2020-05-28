import React, { useEffect } from 'react';
import { T721ToastContainer } from '@frontend/flib-react/lib/shared/toastStyles';
import { useTranslation } from 'react-i18next';
import './locales';
import { NotificationItem } from '../../redux/ducks/notifications';
import { AppState } from '../../redux/ducks';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Toast from '@frontend/flib-react/lib/components/toast';

export interface ToastStackerRState {
    notification: NotificationItem;
}

const ToastStacker: React.FC<ToastStackerRState> = (props: ToastStackerRState) => {
    const { notification } = props;
    const [t] = useTranslation([
        'error_notifications',
        'warning_notifications',
        'success_notifications',
        'info_notifications',
    ]);

    const showToast = (notif: NotificationItem) => {
        switch (notif.kind) {
            case 'success':
                toast.success(<Toast kind={'success'} message={t('success_notifications:' + notif.message)} />);
                break;
            case 'warning':
                toast.warning(<Toast kind={'warning'} message={t('warning_notifications:' + notif.message)} />);
                break;
            case 'error':
                toast.error(<Toast kind={'error'} message={t(notif.message)} />);
                break;
            default:
                toast.info(<Toast kind={'info'} message={t('info_notifications:' + notif.message)} />);
        }
    };

    useEffect(() => {
        if (notification) {
            showToast(notification);
        }
    }, [notification]);

    return <T721ToastContainer />;
};

const mapStateToProps = (state: AppState): ToastStackerRState => ({
    notification: state.notifications.list[state.notifications.list.length - 1],
});

export default connect(mapStateToProps)(ToastStacker);
