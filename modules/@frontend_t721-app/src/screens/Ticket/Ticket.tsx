import React, { useState } from 'react';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { TicketsSearchResponseDto }    from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/tickets/dto/TicketsSearchResponse.dto';
import { useParams, useLocation }                   from 'react-router';
import { v4 }                          from 'uuid';
import { useTranslation }              from 'react-i18next';
import { CategoryFetcher }             from './CategoryFetcher';
import { Error, FullPageLoading }      from '@frontend/flib-react/lib/components';
import { isRequestError }              from '@frontend/core/lib/utils/isRequestError';
import { useToken }                    from '@frontend/core/lib/hooks/useToken';
import { InvitationsOwnedSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/invitations/dto/InvitationsOwnedSearchResponse.dto';
import { TicketEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/tickets/entities/Ticket.entity';
import { InvitationEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/invitations/entities/Invitation.entity';
import { DatesFetcher } from './DatesFetcher';

const Ticket: React.FC = () => {
    const location = useLocation();
    const { id } = useParams();
    const [ t ] = useTranslation(['ticket', 'common']);
    const token = useToken();
    const [uuid] = useState<string>(v4() + '@ticket-details');
    const ticketResp = useRequest<TicketsSearchResponseDto | InvitationsOwnedSearchResponseDto>({
            method: location.pathname.endsWith('/invitation') ? 'invitations.ownedSearch' : 'tickets.search',
            args: [
                token,
                {
                    id: {
                        $eq: id
                    }
                },
            ],
            refreshRate: 60,
        },
        uuid);

    if (ticketResp.response.loading) {
        return <FullPageLoading/>;
    }

    if (isRequestError(ticketResp)) {
        return (<Error message={t('fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={ticketResp.force}/>);
    }

    const respData = ticketResp.response.data['tickets'] || ticketResp.response.data['invitations'];

    if (respData.length === 0) {
        return (<Error message={t('fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={ticketResp.force}/>);
    }

    const ticket: TicketEntity | InvitationEntity = respData[0];

    if (location.pathname.endsWith('/invitation')) {
        return <DatesFetcher
            uuid={uuid}
            ticket={ticket}
        />
    }

    return <CategoryFetcher
        uuid={uuid}
        ticket={ticket as TicketEntity}
    />;
};

export default Ticket;
