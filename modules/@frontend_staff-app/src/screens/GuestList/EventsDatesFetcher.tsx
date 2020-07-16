import React                       from 'react';
import { useRequest }              from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }  from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { EventsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { StaffAppState }           from '../../redux';
import { useSelector }             from 'react-redux';
import { Error, FullPageLoading }  from '@frontend/flib-react/lib/components';
import styled                      from 'styled-components';
import { useTranslation }          from 'react-i18next';
import { formatDateItems }         from '../../utils/formatDateItems';
import { GuestListing }              from './GuestListing';

interface EventsDatesFetcherProps {
    uuid: string;
    entities: string[];
}

export const EventsDatesFetcher: React.FC<EventsDatesFetcherProps> = ({ uuid, entities }: EventsDatesFetcherProps) => {
    const [ t ] = useTranslation(['fetch_errors', 'common']);
    const token = useSelector((state: StaffAppState) => state.auth.token.value);

    const eventsReq = useRequest<EventsSearchResponseDto>({
        method: 'events.search',
        args: [
            token,
            {
                group_id: {
                    $in: entities
                }
            }
        ],
        refreshRate: 5,
    }, uuid);

    const datesReq = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                group_id: {
                    $in: entities
                }
            }
        ],
        refreshRate: 5,
    }, uuid);

    if (eventsReq.response.loading || datesReq.response.loading) {
        return <FullPageLoading/>;
    }

    if (eventsReq.response.error) {
        return <Error message={t('error_cannot_fetch_events')} retryLabel={t('common:retrying_in')} onRefresh={eventsReq.force}/>;
    }

    if (datesReq.response.error) {
        return <Error message={t('error_cannot_fetch_dates')} retryLabel={t('common:retrying_in')} onRefresh={datesReq.force}/>;
    }

    if (eventsReq.response.data.events.length === 0 || datesReq.response.data.dates.length === 0) {
        return <NoEvent>{t('no_event')}</NoEvent>
    }

    return <GuestListing
        events={eventsReq.response.data.events.map(event => ({
            id: event.id,
            name: event.name,
        }))}
        dates={formatDateItems(datesReq.response.data.dates)}/>;
};

const NoEvent = styled.span`
    width: 100%;
    text-align: center;
`;
