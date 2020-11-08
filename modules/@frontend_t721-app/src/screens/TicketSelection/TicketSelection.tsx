import React, { useState }        from 'react';
import { useSelector }            from 'react-redux';
import { T721AppState }           from '../../redux';
import { v4 }                     from 'uuid';
import { useRequest }             from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { Error, FullPageLoading } from '@frontend/flib-react/lib/components';
import { useRouteMatch }          from 'react-router';
import { TicketCategoryFetcher }  from './TicketCategoryFetcher';
import './locales';
import { useTranslation }         from 'react-i18next';
import { isRequestError }         from '@frontend/core/lib/utils/isRequestError';

// tslint:disable-next-line:no-empty-interface
export interface TicketSelectionProps {
}

export const TicketSelection: React.FC<TicketSelectionProps> = (props: TicketSelectionProps): JSX.Element => {

    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [uuid] = useState(v4());
    const match = useRouteMatch();
    const [t] = useTranslation(['event_ticket_list', 'common']);

    const eventId = (match.params as any).id;

    const dateQuery = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                id: {
                    $eq: eventId,
                },
            },
        ],
        refreshRate: 100,
    }, uuid);

    if (dateQuery.response.loading) {
        return <FullPageLoading width={250} height={250}/>;
    }

    if (isRequestError(dateQuery) || dateQuery.response.data.dates.length === 0) {
        return <Error message={t('error_cannot_fetch_dates')} retryLabel={t('common:retrying_in')} onRefresh={dateQuery.force}/>;
    }

    const date = dateQuery.response.data.dates[0];

    return <TicketCategoryFetcher date={date}/>;
};
