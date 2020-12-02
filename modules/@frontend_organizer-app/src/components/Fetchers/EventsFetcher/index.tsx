import React, { PropsWithChildren, useContext, useState } from 'react';
import { useRequest } from '@frontend/core/lib/hooks/useRequest';
import { v4 } from 'uuid';
import { useToken } from  '@frontend/core/lib/hooks/useToken';
import { FullPageLoading, Error } from '@frontend/flib-react/lib/components';
import { useTranslation } from 'react-i18next';
import './locales';
import { isRequestError } from '@frontend/core/lib/utils/isRequestError';
import { UserContext } from '@frontend/core/lib/contexts/UserContext';
import { EventsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { EventEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/events/entities/Event.entity';

export const EventsContext = React.createContext<{ events: EventEntity[], forceFetch: () => void }>(undefined);

export interface EventsFetcherProps {
    eventId?: string;
}

export const EventsFetcher: React.FC<PropsWithChildren<EventsFetcherProps>> = ({ eventId, children }) => {
    const user = useContext(UserContext);
    const [ t ] = useTranslation(['events_fetcher', 'utils']);
    const token = useToken();
    const [fetchEventsUuid] = useState<string>(v4() + '@dates-fetch');

    const eventsReq = useRequest<EventsSearchResponseDto>(
        {
            method: 'events.search',
            args: [
                token,
                {
                    owner: {
                        $eq: user.id
                    },
                    $sort: [
                        {
                            $field_name: 'created_at',
                            $order: 'desc',
                        },
                    ],
                },
            ],
            refreshRate: 60,
        },
        fetchEventsUuid,
    );

    if (eventsReq.response.loading) {
        return <FullPageLoading/>;
    }

    if (isRequestError(eventsReq)) {
        return <Error message={t('events_fetch_error')} retryLabel={t('utils:retrying_in')} onRefresh={eventsReq.force} />;
    }

    return <EventsContext.Provider value={{
        events: eventId ? eventsReq.response.data.events
            .filter(event => event.id === eventId) : eventsReq.response.data.events,
        forceFetch: eventsReq.force,
    }}>{children}</EventsContext.Provider>;
}
