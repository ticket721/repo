import React, { useState }          from 'react';
import { useRequest }               from '@frontend/core/lib/hooks/useRequest';
import { TicketsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/tickets/dto/TicketsSearchResponse.dto';
import { useSelector }              from 'react-redux';
import { T721AppState }             from '../../redux';
import { Redirect, useParams }      from 'react-router';
import { v4 }                       from 'uuid';
import { useTranslation }           from 'react-i18next';
import { CategoryFetcher }          from './CategoryFetcher';
import { Error, FullPageLoading }   from '@frontend/flib-react/lib/components';
import { isRequestError }           from '@frontend/core/lib/utils/isRequestError';

const Ticket: React.FC = () => {
    const { id } = useParams();
    const [ t ] = useTranslation(['ticket', 'common']);
    const token = useSelector((state: T721AppState) => state.auth.token.value);
    const [uuid] = useState<string>(v4() + '@ticket-details');
    const ticketResp = useRequest<TicketsSearchResponseDto>({
            method: 'tickets.search',
            args: [
                token,
                {
                    id: {
                        $eq: id
                    },
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

    const ticket = ticketResp.response.data.tickets[0];

    if (ticket) {
        return <CategoryFetcher
            uuid={uuid}
            ticket={ticket}
        />;
    } else {
        return <Redirect to={'/'}/>;
    }
};

export default Ticket;
