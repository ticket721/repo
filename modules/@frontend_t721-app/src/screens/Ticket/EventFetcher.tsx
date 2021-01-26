import React                      from 'react';
import { useRequest }              from '@frontend/core/lib/hooks/useRequest';
import { useTranslation }          from 'react-i18next';
import { Error, FullPageLoading }  from '@frontend/flib-react/lib/components';
import { EventsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { TicketDetails }           from './TicketDetails';
import { CategoryEntity }          from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { TicketEntity }            from '@common/sdk/lib/@backend_nest/libs/common/src/tickets/entities/Ticket.entity';
import { DateEntity }              from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { isRequestError }          from '@frontend/core/lib/utils/isRequestError';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import { InvitationEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/invitations/entities/Invitation.entity';

interface EventFetcherProps {
    uuid: string;
    ticket: TicketEntity | InvitationEntity;
    dates: DateEntity[];
    category?: CategoryEntity;
}

export const EventFetcher: React.FC<EventFetcherProps> = (
    {
        uuid,
        category,
        ticket,
        dates
    }: EventFetcherProps) => {
    const token = useToken();
    const [ t ] = useTranslation('ticket_details');
    const eventResp = useRequest<EventsSearchResponseDto>({
            method: 'events.search',
            args: [
                token,
                {
                    id: {
                        $eq: dates[0].event
                    }
                }
            ],
            refreshRate: 60,
        },
        uuid);

    if (eventResp.response.loading) {
        return <FullPageLoading/>;
    }

    if (isRequestError(eventResp) || eventResp.response.data.events.length === 0) {
        return (<Error message={t('fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={eventResp.force}/>);
    }

    const event = eventResp.response.data.events[0];

    return <TicketDetails
        ticket={ticket}
        category={category}
        dates={dates}
        event={event}
    />;
};
