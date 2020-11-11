import React from 'react';
import { useParams } from 'react-router';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import { useTranslation } from 'react-i18next';

import { useRequest } from '@frontend/core/lib/hooks/useRequest';

import { FullPageLoading, Error } from '@frontend/flib-react/lib/components';
import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { CreateCategoryForm }     from './CreateCategoryForm';
import { checkFormatDate }        from '@frontend/core/lib/utils/date';
import { eventParam }             from '../../types';
import { isRequestError }         from '@frontend/core/lib/utils/isRequestError';

export const CreateCategory: React.FC = () => {
    const { t } = useTranslation('common');
    const { eventId } = useParams<eventParam>();

    const [uuid] = React.useState('create-category-prefetch@' + eventId);
    const token = useToken();

    const datesResp = useRequest<DatesSearchResponseDto>(
        {
            method: 'dates.search',
            args: [
                token,
                {
                    event: {
                        $eq: eventId,
                    },
                    $sort: [{
                        $field_name: 'timestamps.event_end',
                        $order: 'asc',
                    }]
                },
            ],
            refreshRate: 0,
        },
        uuid
    );

    if (datesResp.response.loading) {
        return <FullPageLoading/>;
    }

    if (isRequestError(datesResp)) {
        return <Error message={t('error_cannot_fetch', { entity: 'date'})} retryLabel={t('retrying_in')} onRefresh={datesResp.force}/>;
    }

    return <CreateCategoryForm
    dates={datesResp.response.data.dates.map(date => ({
        id: date.id,
        eventBegin: checkFormatDate(date.timestamps.event_begin),
        eventEnd: checkFormatDate(date.timestamps.event_end),
    }))}/>;
};
