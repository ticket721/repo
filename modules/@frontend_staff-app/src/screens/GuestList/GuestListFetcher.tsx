import React, { useState }            from 'react';
import { useSelector }                from 'react-redux';
import { StaffAppState }              from '../../../redux';
import { useRequest }                 from '@frontend/core/lib/hooks/useRequest';
import { EventsGuestlistResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsGuestlistResponse.dto';
import { v4 }                         from 'uuid';
import { Error, FullPageLoading }     from '@frontend/flib-react/lib/components';
import { useTranslation }             from 'react-i18next';
import './locales';
import styled                         from 'styled-components';
import { AttendeesList }              from './AttendeesList';
import { TicketsCountResponseDto }    from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/tickets/dto/TicketsCountResponse.dto';

export const GuestListFetcher: React.FC = () => {
    const [ t ] = useTranslation('guestlist');
    const [uuid] = useState(v4() + '@guest-list');
    const [
        token,
        eventId,
        dateId,
        filteredCategories,
    ] = useSelector((state: StaffAppState) =>
        [
            state.auth.token.value,
            state.currentEvent.eventId,
            state.currentEvent.dateId,
            state.currentEvent.filteredCategories,
        ]);

    const guestListReq = useRequest<EventsGuestlistResponseDto>({
        method: 'events.guestlist',
        args: [
            token,
            eventId,
            {
                dateIds: [dateId]
            }
        ],
        refreshRate: 20
    }, uuid);

    const ticketCountReq = useRequest<TicketsCountResponseDto>({
        method: 'tickets.count',
        args: [
            token,
            {
                parent_id: {
                    $in: [eventId, dateId],
                },
                category: {
                    $in: filteredCategories.map(category => category.id),
                }
            }
        ],
        refreshRate: 20
    }, uuid);

    if (guestListReq.response.loading || ticketCountReq.response.loading) {
        return <FullPageLoading/>;
    }

    if (guestListReq.response.error) {
        return <Error message={t('error_cannot_fetch_guestlist')} retryLabel={t('common:retrying_in')} onRefresh={guestListReq.force}/>;
    }

    if (ticketCountReq.response.error) {
        return <Error message={t('error_cannot_fetch_guestlist')} retryLabel={t('common:retrying_in')} onRefresh={ticketCountReq.force}/>;
    }

    if (guestListReq.response.data.guests.length === 0) {
        return <NoGuestList>{t('no_guestlist')}</NoGuestList>
    }

    return <AttendeesList
        guests={
            guestListReq.response.data.guests
                .filter(guest =>
                    filteredCategories.findIndex(category => category.id === guest.category) !== -1
                )
        }
        ticketsCount={ticketCountReq.response.data.tickets.count}/>;
};

const NoGuestList = styled.span`
    width: 100%;
    text-align: center;
`;
