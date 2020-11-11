import React                      from 'react';
import { useRequest }             from '@frontend/core/lib/hooks/useRequest';
import { useTranslation }         from 'react-i18next';
import { Error, FullPageLoading } from '@frontend/flib-react/lib/components';
import { Redirect }               from 'react-router';
import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { CategoryEntity }         from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { TicketEntity }           from '@common/sdk/lib/@backend_nest/libs/common/src/tickets/entities/Ticket.entity';
import { EventFetcher }           from './EventFetcher';
import { isRequestError }         from '@frontend/core/lib/utils/isRequestError';
import { useToken } from '@frontend/core/lib/hooks/useToken';

interface DatesFetcherProps {
    uuid: string;
    ticket: TicketEntity;
    category: CategoryEntity;
}

export const DatesFetcher: React.FC<DatesFetcherProps> = (
    {
        uuid,
        category,
        ticket
    }: DatesFetcherProps) => {
    const token = useToken();
    const [ t ] = useTranslation('ticket_details');
    const datesResp = useRequest<DatesSearchResponseDto>({
            method: 'dates.search',
            args: [
                token,
                {
                    id: {
                        $in: category.dates
                    }
                }
            ],
            refreshRate: 60,
        },
        uuid);

    if (datesResp.response.loading) {
        return <FullPageLoading/>;
    }

    if (isRequestError(datesResp)) {
        return (<Error message={t('fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={datesResp.force}/>);
    }

    const dates = datesResp.response.data.dates;

    if (dates) {
        return <EventFetcher
            uuid={uuid}
            ticket={ticket}
            category={category}
            dates={dates}
        />;
    } else {
        return <Redirect to={'/'}/>;
    }
};
