import React                      from 'react';
import { useRequest }             from '@frontend/core/lib/hooks/useRequest';
import { useSelector }            from 'react-redux';
import { T721AppState }           from '../../redux';
import { useTranslation }         from 'react-i18next';
import { Error, FullPageLoading } from '@frontend/flib-react/lib/components';
import { Redirect }               from 'react-router';
import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { CategoryEntity }         from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { TicketEntity }           from '@common/sdk/lib/@backend_nest/libs/common/src/tickets/entities/Ticket.entity';
import { EventFetcher }           from './EventFetcher';

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
    const token = useSelector((state: T721AppState) => state.auth.token.value);
    const [ t ] = useTranslation('ticket_details');
    const { response: datesResp, force: forceDatesReq } = useRequest<DatesSearchResponseDto>({
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

    if (datesResp.loading) {
        return <FullPageLoading/>;
    }

    if (datesResp.error) {
        return (<Error message={t('fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={forceDatesReq}/>);
    }

    const dates = datesResp.data.dates;

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
