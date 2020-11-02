import React from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { useRequest } from '@frontend/core/lib/hooks/useRequest';
import { AppState } from '@frontend/core/lib/redux';

import { FullPageLoading, Error } from '@frontend/flib-react/lib/components';
import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { CreateCategoryForm } from './CreateCategoryForm';
import { checkFormatDate } from '@frontend/core/lib/utils/date';
import { eventParam } from '../../types';

export const CreateCategory: React.FC = () => {
    const { t } = useTranslation('common');
    const { eventId } = useParams<eventParam>();

    const [uuid] = React.useState('create-category-prefetch@' + eventId);
    const token = useSelector((state: AppState): string => state.auth.token.value);

    const { response: datesResp, force: forceDatesReq } = useRequest<DatesSearchResponseDto>(
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

    if (datesResp.loading) {
        return <FullPageLoading/>;
    }

    if (datesResp.error) {
        return <Error message={t('error_cannot_fetch', { entity: 'date'})} retryLabel={t('retrying_in')} onRefresh={forceDatesReq}/>;
    }

    return <CreateCategoryForm
    dates={datesResp.data.dates.map(date => ({
        id: date.id,
        eventBegin: checkFormatDate(date.timestamps.event_begin),
        eventEnd: checkFormatDate(date.timestamps.event_end),
    }))}/>;
};
