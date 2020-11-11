import React, { useEffect, useState } from 'react';
import { v4 }                         from 'uuid';

import { useRequest }              from '@frontend/core/lib/hooks/useRequest';

import { useTranslation }  from 'react-i18next';
import './locales';
import { FullPageLoading, Error } from '@frontend/flib-react/lib/components';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import './locales';
import { useParams } from 'react-router';
import { eventParam } from '../../types';
import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { EventsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { CategoriesFetcher } from './CategoriesFetcher';

export const CategoriesDashboard: React.FC = () => {
    const [ t ] = useTranslation('categories_dashboard');

    const [fetchDatesUuid] = useState(v4() + '@dates-dashboard');
    const token = useToken();

    const { eventId } = useParams<eventParam>();

    const { response: eventResp, force: forceEvent } = useRequest<EventsSearchResponseDto>({
        method: 'events.search',
        args: [
            token,
            {
                id: {
                    $eq: eventId
                },
            }
        ],
        refreshRate: 50
    }, fetchDatesUuid);

    const { response: datesResp, force: forceDates } = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                event: {
                    $eq: eventId
                },
            }
        ],
        refreshRate: 50
    }, fetchDatesUuid);

    useEffect(() => {
        forceDates();
    // eslint-disable-next-line
    }, []);

    if (eventResp.loading || datesResp.loading) {
        return <FullPageLoading/>;
    }

    if (eventResp.error) {
        return <Error message={t('event_fetch_error')} onRefresh={forceEvent}/>;
    }

    if (datesResp.error) {
        return <Error message={t('dates_fetch_error')} onRefresh={forceDates}/>;
    }

    return <CategoriesFetcher
    eventId={eventResp.data.events[0].id}
    eventName={eventResp.data.events[0].name}
    groupId={eventResp.data.events[0].group_id}
    dates={datesResp.data.dates}/>;
};
