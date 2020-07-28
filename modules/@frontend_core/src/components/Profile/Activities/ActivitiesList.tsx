import { ActivitiesContainer, FullPageLoading, Error } from '@frontend/flib-react/lib/components';
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
    force: () => void;
    data: MetadatasFetchResponseDto;
    limit?: number;
    link?: string;
}

export const ActivitiesList = (props: ActivitiesListProps): JSX.Element => {
    const [t] = useTranslation(['activities_list', 'common']);
    const history = useHistory();

    if (props.loading) {
        return <FullPageLoading />;
    }

    if (props.error) {
        return <Error retryLabel={t('common:retrying_in')} message={t('fetch_error')} onRefresh={props.force} />;
    }

    return (
        <ActivitiesContainer
            title={t('title')}
            viewAllAction={props.link ? () => history.push(props.link) : undefined}
            viewAllLabel={props.link ? t('view_all') : undefined}
        >
            {props.data.metadatas.map(
                (metadata: MetadataEntity, idx: number): JSX.Element => {
                    return <ActivityCard type={metadata.type_name} metadata={metadata} key={idx} />;
                },
            )}
        </ActivitiesContainer>
    );
};
