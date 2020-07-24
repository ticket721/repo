import React, { useState } from 'react';
import {
    LinksContainer,
    ArrowLink,
    WalletHeader,
    LanguageLink,
    FullPageLoading,
} from '@frontend/flib-react/lib/components';
import { useRequest } from '../../../hooks/useRequest';
import { MetadatasFetchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/metadatas/dto/MetadatasFetchResponse.dto';
import { v4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../redux';
import { ActivitiesList } from '../Activities/ActivitiesList';
import { Logout } from '../../../redux/ducks/auth';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import '../locales';
import { TicketsCountResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/tickets/dto/TicketsCountResponse.dto';

export interface ProfileRootProps {
    desktop?: boolean;
    extraButtons?: JSX.Element[];
}

const ProfileRoot: React.FC<ProfileRootProps> = ({ desktop, extraButtons }: ProfileRootProps): JSX.Element => {
    const [uuid] = useState(v4());
    const { token, userUuid, username, address } = useSelector((state: AppState) => ({
        token: state.auth.token?.value,
        userUuid: state.auth.user?.uuid,
        username: state.auth.user?.username,
        address: state.auth.user?.address,
    }));
    const dispatch = useDispatch();
    const history = useHistory();
    const [t, i18n] = useTranslation(['profile', 'common']);

    const { response: activityResponse, force } = useRequest<MetadatasFetchResponseDto>(
        {
            method: 'metadatas.fetch',
            args: [
                token,
                {
                    useReadRights: [
                        {
                            id: userUuid,
                            type: 'user',
                            field: 'id',
                        },
                    ],
                    withLinks: [
                        {
                            id: userUuid,
                            type: 'user',
                            field: 'id',
                        },
                    ],
                    metadataClassName: 'history',
                },
            ],
            refreshRate: 50,
        },
        uuid,
    );

    const tickets = useRequest<TicketsCountResponseDto>(
        {
            method: 'tickets.count',
            args: [
                token,
                {
                    owner: {
                        $eq: address,
                    },
                    status: {
                        $ne: 'canceled',
                    },
                },
            ],
            refreshRate: 50,
        },
        uuid,
    );

    if (tickets.response.loading) {
        return <FullPageLoading />;
    }

    return (
        <>
            <WalletHeader
                username={username}
                picture={'/favicon.ico'}
                tickets={tickets.response.error ? '?' : tickets.response.data.tickets.count}
            />
            <ActivitiesList
                loading={activityResponse.loading}
                error={activityResponse.error}
                data={activityResponse.data}
                force={force}
                limit={3}
                link={desktop ? history.location.pathname + '?profile=activities' : 'profile/activities'}
            />
            <LinksContainer title={t('account')}>
                {extraButtons || null}
                <LanguageLink
                    label={t('language')}
                    currentLanguage={t(i18n.language.slice(0, 2))}
                    onClick={() => {
                        history.push(desktop ? history.location.pathname + '?profile=language' : 'profile/language');
                    }}
                />
                <ArrowLink
                    label={t('log_out')}
                    onClick={() => {
                        dispatch(Logout());
                        history.replace('/');
                    }}
                />
            </LinksContainer>
        </>
    );
};

export default ProfileRoot;
