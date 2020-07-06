import { ActivitiesContainer } from '@frontend/flib-react/lib/components';
import Skeleton from '@frontend/flib-react/lib/components/loading/skeleton';
import React from 'react';
import { useTranslation } from 'react-i18next';
import './ActivitiesList.locales';
import { useHistory } from 'react-router';
import { MetadatasFetchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/metadatas/dto/MetadatasFetchResponse.dto';
import { MetadataEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/metadatas/entities/Metadata.entity';
import { ActivityCard } from './ActivityCards';

export interface ActivitiesListProps {
    loading: boolean;
    error: any;
    data: MetadatasFetchResponseDto;
    limit?: number;
    link?: string;
}

export const ActivitiesList = (props: ActivitiesListProps): JSX.Element => {
    const [t] = useTranslation('activities_list');
    const history = useHistory();

    return (
        <ActivitiesContainer
            title={t('title')}
            viewAllAction={props.link ? () => history.push(props.link) : undefined}
            viewAllLabel={props.link ? t('view_all') : undefined}
        >
            {props.loading ? (
                <Skeleton type={'text'} ready={false} showLoadingAnimation={true} children={null} />
            ) : props.error || props.data.metadatas.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h3 style={{ opacity: 0.5 }}>{t(props.error ? 'fetch_error' : 'no_activity')}</h3>
                </div>
            ) : (
                props.data.metadatas.map(
                    (metadata: MetadataEntity, idx: number): JSX.Element => {
                        return <ActivityCard type={metadata.type_name} metadata={metadata} key={idx} />;
                    },
                )
            )}
        </ActivitiesContainer>
    );
};
