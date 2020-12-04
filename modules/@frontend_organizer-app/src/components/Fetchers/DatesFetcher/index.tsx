import React, { PropsWithChildren, useContext, useState } from 'react';
import { useRequest } from '@frontend/core/lib/hooks/useRequest';
import { v4 } from 'uuid';
import { useToken } from  '@frontend/core/lib/hooks/useToken';
import { FullPageLoading, Error } from '@frontend/flib-react/lib/components';
import { useTranslation } from 'react-i18next';
import './locales';
import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { DateEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { isRequestError } from '@frontend/core/lib/utils/isRequestError';
import { EventsContext } from '../EventsFetcher';

export const DatesContext = React.createContext<{ dates: DateEntity[], forceFetch: () => void }>(undefined);

export interface DatesFetcherProps {
    eventId?: string;
    dateId?: string;
}

export const DatesFetcher: React.FC<PropsWithChildren<DatesFetcherProps>> = ({ eventId, dateId, children }) => {
    const eventsCtx = useContext(EventsContext);
    const [ t ] = useTranslation(['dates_fetcher', 'utils']);
    const token = useToken();
    const [fetchDatesUuid] = useState<string>(v4() + '@dates-fetch');

    const datesReq = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                event: {
                    $eq: eventId || eventsCtx.events[0].id,
                },
                $sort: [{
                    $field_name: 'timestamps.event_end',
                    $order: 'asc',
                }],
            },
        ],
        refreshRate: 60,
    }, fetchDatesUuid);

    if (datesReq.response.loading) {
        return <FullPageLoading/>;
    }

    if (isRequestError(datesReq)) {
        return <Error message={t('dates_fetch_error')} retryLabel={t('utils:retrying_in')} onRefresh={datesReq.force} />;
    }

    return <DatesContext.Provider value={{
        dates: dateId ? datesReq.response.data.dates
            .filter(date => date.id === dateId) : datesReq.response.data.dates,
        forceFetch: datesReq.force,
    }}>{children}</DatesContext.Provider>;
}
