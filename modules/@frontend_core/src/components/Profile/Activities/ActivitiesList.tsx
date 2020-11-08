import { ActivitiesContainer, FullPageLoading, Error } from '@frontend/flib-react/lib/components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import './ActivitiesList.locales';
import { useHistory } from 'react-router';
import { MetadataEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/metadatas/entities/Metadata.entity';
import { ActivityCard } from './ActivityCards';
import { isRequestError } from '../../../utils/isRequestError';
import { RequestBag } from '../../../hooks/useRequest';

export interface ActivitiesListProps {
    response: RequestBag<any>;
    link?: string;
    limit?: number;
}

export const ActivitiesList = (props: ActivitiesListProps): JSX.Element => {
    const [t] = useTranslation(['activities_list', 'common']);
    const history = useHistory();

    if (props.response.response.loading) {
        return <FullPageLoading />;
    }

    if (isRequestError(props.response)) {
        return (
            <Error retryLabel={t('common:retrying_in')} message={t('fetch_error')} onRefresh={props.response.force} />
        );
    }

    return (
        <ActivitiesContainer
            title={t('title')}
            viewAllAction={props.link ? () => history.push(props.link) : undefined}
            viewAllLabel={props.link ? t('view_all') : undefined}
        >
            {props.response.response.data.metadatas.map(
                (metadata: MetadataEntity, idx: number): JSX.Element => {
                    return <ActivityCard type={metadata.type_name} metadata={metadata} key={idx} />;
                },
            )}
        </ActivitiesContainer>
    );
};
