import './locales';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/ducks';
import { v4 } from 'uuid';
import { useRequest } from '../../../hooks/useRequest';
import { ActivitiesContainer, TitleText } from '@frontend/flib-react/lib/components';
import { useTranslation } from 'react-i18next';
import Skeleton from '@frontend/flib-react/lib/components/loading/skeleton';
import { MetadatasFetchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/metadatas/dto/MetadatasFetchResponse.dto';

const activities = ['notif0', 'notif1', 'notif2', 'notif3'];

const Activities: React.FC = () => {
    const [uuid] = useState(v4());
    const { token, userUuid } = useSelector((state: AppState) => ({
        token: state.auth.token.value,
        userUuid: state.auth.user?.uuid,
    }));
    const [t] = useTranslation('profile_activities');

    const { response } = useRequest<MetadatasFetchResponseDto>(
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

    if (response.loading) {
        return (
            <ActivitiesContainer title={t('title')}>
                <Skeleton type={'text'} ready={false} showLoadingAnimation={true} children={null} />
            </ActivitiesContainer>
        );
    }

    if (response.data.metadatas.length === 0) {
        return (
            <ActivitiesContainer title={t('title')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h3 style={{ opacity: 0.5 }}>{t('no_activity')}</h3>
                </div>
            </ActivitiesContainer>
        );
    }

    return (
        <ActivitiesContainer title={t('title')}>
            {activities.map((e, i) => {
                return <TitleText text={e} key={e + i} />;
            })}
        </ActivitiesContainer>
    );
};

export default Activities;
