import React, { useState, useContext } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';

import { AppState } from '../../redux/ducks';
import { FullPageLoading } from '@frontend/flib-react/lib/components';
import { useRequest } from '../../hooks/useRequest';
import { UserContext } from '../../utils/UserContext';
import { PushNotification } from '../../redux/ducks/notifications';

import { useTranslation } from 'react-i18next';
import './locales';

interface ProtectedByOwnershipProps {
    children: React.ReactNode;
    entityType: 'events' | 'dates' | 'categories';
    entityParam: 'eventId' | 'dateId' | 'categoryId';
}

export const ProtectedByOwnership: React.FC<ProtectedByOwnershipProps> = ({
    children,
    entityType,
    entityParam,
}): JSX.Element => {
    const { t } = useTranslation('protected_by_ownership');

    const dispatch = useDispatch();
    const [uuid] = useState(v4() + '@protected-by-ownership');
    const token = useSelector((state: AppState): string => state.auth.token.value);

    const params = useParams();

    const { id } = useContext(UserContext);

    const { response: ownerResp } = useRequest<{ owner: string }>(
        {
            method: `${entityType}.owner`,
            args: [token, params[entityParam]],
            refreshRate: 0,
        },
        uuid,
    );

    if (ownerResp.loading) {
        return <FullPageLoading />;
    }

    if (ownerResp.error) {
        dispatch(PushNotification(t('ressource_not_found'), 'error'));
        return <Redirect to={'/'} />;
    }

    if (ownerResp.data.owner !== id) {
        dispatch(PushNotification(t('access_forbidden'), 'error'));
        return <Redirect to={'/'} />;
    }

    return <>{children}</>;
};
