import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import './locales';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { PushNotification } from '../../redux/ducks/notifications';

export const CloseRedirect = () => {
    const history = useHistory();
    const parsedQuery = new URLSearchParams(history.location.search);
    const message = parsedQuery.get('message') || 'default';
    const [t] = useTranslation('close_redirect');
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(PushNotification(t(message), 'success'));
    }, []);

    return (
        <div
            style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <p>{t('close_safely')}</p>
        </div>
    );
};
