import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { v4 } from 'uuid';
import './locales';
import { useRequest } from '../../hooks/useRequest';
import { useHistory } from 'react-router';
import { PushNotification } from '../../redux/ducks/notifications';
import { useDispatch } from 'react-redux';

export const ValidateRoute: React.FC = () => {
    const history = useHistory();
    const dispatch = useDispatch();
    const [uuid] = useState<string>(v4() + '@validate-route');
    const { t } = useTranslation('validate_route');

    const { response: validateEmailResp } = useRequest(
        {
            method: 'validateEmail',
            args: [history.location.search.match(/token=(([a-zA-Z0-9]|\.)+)/)[1]],
            refreshRate: 0,
        },
        uuid,
    );

    useEffect(() => {
        if (validateEmailResp.data) {
            dispatch(PushNotification(t('email_confirmed'), 'success'));
            history.push('/');
        }
    }, [validateEmailResp.data]);

    useEffect(() => {
        if (validateEmailResp.error) {
            console.log(validateEmailResp.error.data);
            if (validateEmailResp.error.statusCode === 500) {
                dispatch(PushNotification(t('internal_server_error'), 'error'));
            }
            dispatch(PushNotification(t(validateEmailResp.error), 'error'));
            history.push('/login');
        }
    }, [validateEmailResp.error]);

    return (
        <div>
            <ProcessEmail>{t('message')}</ProcessEmail>
        </div>
    );
};

const ProcessEmail = styled.span`
    margin-bottom: 15px;
    text-align: center;
    line-height: 22px;
`;
