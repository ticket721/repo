import React                       from 'react';
import { useTranslation }          from 'react-i18next';
import { useRequest }              from '@frontend/core/lib/hooks/useRequest';
import { EventsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { Error, FullPageLoading }  from '@frontend/flib-react/lib/components';
import { Tickets }                 from './Tickets';
import { CategoryEntity }          from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { TicketEntity }            from '@common/sdk/lib/@backend_nest/libs/common/src/tickets/entities/Ticket.entity';
import { DateEntity }              from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { EventEntity }             from '@backend/nest/libs/common/src/events/entities/Event.entity';
import { isRequestError }          from '@frontend/core/lib/utils/isRequestError';
import { useToken } from '@frontend/core/lib/hooks/useToken';

interface EventsFetcherProps {
    uuid: string;
    tickets: TicketEntity[];
    categories: CategoryEntity[];
    dates: DateEntity[];
}

export const EventsFetcher: React.FC<EventsFetcherProps> = (
    {
        uuid,
        tickets,
        categories,
        dates
    }: EventsFetcherProps) => {

    const token = useToken();
    const [ t ] = useTranslation(['wallet', 'common']);

    const eventsResp = useRequest<EventsSearchResponseDto>({
            method: 'events.search',
            args: [
                token,
                {
                    id: {
                        $in: []
                            .concat(
                                ...dates.map(date => date.event)
                            )
                            .filter(
                                (eventId: string, idx: number, arr: string[]) => arr.indexOf(eventId) === idx
                            )

                    }
                }
            ],
            refreshRate: 60,
        },
        uuid);

    if (eventsResp.response.loading) {
        return <FullPageLoading/>;
    }

    if (isRequestError(eventsResp) || eventsResp.response.data?.events?.length === 0) {
        return (<Error message={t('fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={eventsResp.force}/>);
    }

    const events = eventsResp.response.data.events;

    return <Tickets
        tickets={tickets}
        categories={
            Object.fromEntries(new Map(categories.map((category: CategoryEntity) => [category.id, category])))
        }
        dates={
            Object.fromEntries(new Map(dates.map((date: DateEntity) => [date.id, date])))
        }
        events={
            Object.fromEntries(new Map(events.map((event: EventEntity) => [event.id, event])))
        }
    />

};
