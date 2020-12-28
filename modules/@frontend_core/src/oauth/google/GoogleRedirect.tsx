import { FullPageLoading } from '@frontend/flib-react/lib/components';
import React, { useContext, useEffect } from 'react';
import { isNil } from 'lodash';
import { useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { PushNotification } from '../../redux/ducks/notifications';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { AuthState } from '../../redux/ducks/auth/types';
import { GoogleLogin } from '../../redux/ducks/auth';
import { AppState } from '../../redux/index';
import { useDeepEffect } from '../../hooks/useDeepEffect';
import { event } from '../../tracking/registerEvent';
import { UserContext } from '../../contexts/UserContext';

export const GoogleRedirect: React.FC = (): JSX.Element => {
    const location = useLocation();
    const history = useHistory();
    const dispatch = useDispatch();
    const [t] = useTranslation('google_redirect');
    const auth = useSelector((state: AppState): AuthState => state.auth);
    const user = useContext(UserContext);

    useEffect(() => {
        const query = new URLSearchParams(location.hash.slice(1));
        const idToken = query.get('id_token');
        const state = query.get('state');

        if (isNil(idToken) || idToken === '') {
            dispatch(PushNotification(t('invalid_code'), 'error'));
            history.replace('/login', {
                from: state,
            });
        } else {
            dispatch(GoogleLogin(idToken));
        }
    }, [location]);

    useDeepEffect(() => {
        const query = new URLSearchParams(location.hash.slice(1));
        const state = query.get('state');

        if (!auth.loading) {
            if (auth.submit && !auth.errors && auth.token && user !== null) {
                event('Auth', 'Login', 'User logged in');
                if (state.match(/\//g).length > 1) {
                    history.replace('/');
                    history.push(state);
                } else {
                    history.replace(state);
                }
            } else if (auth.errors) {
                history.replace('/login', {
                    from: state,
                });
            }
        }
    }, [auth, location, user]);

    return (
        <>
            <FullPageLoading />
        </>
    );
};
