import React                      from 'react';
import { useTranslation }         from 'react-i18next';
import { useRequest }             from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { Error, FullPageLoading } from '@frontend/flib-react/lib/components';
import { CategoryEntity }         from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { TicketEntity }           from '@common/sdk/lib/@backend_nest/libs/common/src/tickets/entities/Ticket.entity';
import { InvitationEntity }            from '@common/sdk/lib/@backend_nest/libs/common/src/invitations/entities/Invitation.entity';
import { EventsFetcher }          from './EventsFetcher';
import { isRequestError }         from '@frontend/core/lib/utils/isRequestError';
import { useToken } from '@frontend/core/lib/hooks/useToken';

interface DatesFetcherProps {
    uuid: string;
    tickets: TicketEntity[];
    categories: CategoryEntity[];
    invitations: InvitationEntity[];
}

export const DatesFetcher: React.FC<DatesFetcherProps> = (
    {
        uuid,
        tickets,
        categories,
        invitations,
    }: DatesFetcherProps) => {

    const token = useToken();
    const [ t ] = useTranslation(['wallet', 'common']);

    const datesResp = useRequest<DatesSearchResponseDto>({
            method: 'dates.search',
            args: [
                token,
                {
                    id: {
                        $in: categories.flatMap(cat => cat.dates)
                        .concat(invitations.flatMap(invit => invit.dates))
                        .filter(
                            (dateId: string, idx: number, arr: string[]) => arr.indexOf(dateId) === idx
                        )
                    }
                }
            ],
            refreshRate: 60,
        },
        uuid);

    if (datesResp.response.loading) {
        return <FullPageLoading/>;
    }

    if (isRequestError(datesResp) || datesResp.response.data?.dates?.length === 0) {
        return (<Error message={t('fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={datesResp.force}/>);
    }

    const dates = datesResp.response.data.dates;

    return <EventsFetcher uuid={uuid} tickets={tickets} categories={categories} invitations={invitations} dates={dates}/>;

};
