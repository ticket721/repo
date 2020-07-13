import React, { useState }                                                             from 'react';
import { useRequest }                                                                  from '@frontend/core/lib/hooks/useRequest';
import { EventsSearchResponseDto }                                                     from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { DatesSearchResponseDto }                                                      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { CategoriesSearchResponseDto }                                                 from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { useDeepEffect }                                                               from '@frontend/core/lib/hooks/useDeepEffect';
import { EventDashboard, formatDatesAndCovers, formatEventName, formatPricesAndSeats } from './formatters';
import { EventCard }                                                                   from './EventCard';
import styled                                                                          from 'styled-components';
import { useHistory }                                                                  from 'react-router';
import { FullPageLoading }                                                             from '@frontend/flib-react/lib/components';
import { PushNotification }                                                            from '@frontend/core/lib/redux/ducks/notifications';

import { useTranslation } from 'react-i18next';
import './locales';
import { useDispatch }    from 'react-redux';

interface EventsFetcherProps {
    token: string;
    uuid: string;
    groupIds: string[];
}

export const EventsFetcher: React.FC<EventsFetcherProps> = ({ token, uuid, groupIds }) => {
    const history = useHistory();
    const [ t ] = useTranslation('dashboard');
    const dispatch = useDispatch();

    const [ formattedEvents, setFormattedEvents ] = useState<EventDashboard[]>([]);
    const { response: eventsResp } = useRequest<EventsSearchResponseDto>(
        {
            method: 'events.search',
            args: [
                token,
                {
                    group_id: {
                        $in: groupIds,
                    },
                    $sort: [{
                        $field_name: 'updated_at',
                        $order: 'desc'
                    }]
                },
            ],
            refreshRate: 5,
        },
        uuid
    );

    const { response: datesResp } = useRequest<DatesSearchResponseDto>(
        {
            method: 'dates.search',
            args: [
                token,
                {
                    group_id: {
                        $in: groupIds,
                    }
                },
            ],
            refreshRate: 5,
        },
        uuid
    );

    const { response: categoriesResp } = useRequest<CategoriesSearchResponseDto>(
        {
            method: 'categories.search',
            args: [
                token,
                {
                    group_id: {
                        $in: groupIds,
                    }
                },
            ],
            refreshRate: 5,
        },
        uuid
    );

    useDeepEffect(() => {
        if (eventsResp.data) {
            setFormattedEvents(formatEventName(eventsResp.data.events));
        }
    }, [eventsResp.data]);

    useDeepEffect(() => {
        if (formattedEvents.length > 0 && datesResp.data) {
            const filteredDates = datesResp.data.dates.filter(d => d.parent_type === 'event');
            if (filteredDates.length > 0) {
                setFormattedEvents(formatDatesAndCovers(filteredDates, formattedEvents));
            }
        }
    }, [formattedEvents.length, datesResp.data]);

    useDeepEffect(() => {
        if (
            formattedEvents.length > 0 &&
            formattedEvents[0].datesRange &&
            categoriesResp.data?.categories
        ) {
            setFormattedEvents(formatPricesAndSeats(categoriesResp.data.categories, formattedEvents));
        }
    }, [formattedEvents, categoriesResp.data]);

    useDeepEffect(() => {
        if (eventsResp.error || datesResp.error || categoriesResp.error) {
            dispatch(PushNotification(t('error_notif'), 'error'));
        }
    }, [eventsResp.error, datesResp.error, categoriesResp.error]);

    return (
        <Cards>
            {
                eventsResp.loading || datesResp.loading || categoriesResp.loading ?
                    <FullPageLoading /> :
                formattedEvents.length > 0 ?
                    formattedEvents.map((event) => (
                        <div
                        key={event.groupId}
                        onClick={() => history.push(`/group/${event.groupId}`)}>
                            <EventCard
                            {...event}/>
                        </div>
                    )) :
                    <ReloadMsg>{t('reload_msg')}</ReloadMsg>
            }
        </Cards>
    );
};

const Cards = styled.div`
    display: flex;
    flex-wrap: wrap;

    & > div {
        width: fit-content;
        margin-bottom: ${props => props.theme.doubleSpacing};
    }

    & > div:nth-child(3n+2) {
        margin-left: ${props => props.theme.doubleSpacing};
        margin-right: ${props => props.theme.doubleSpacing};
    }
`;

const ReloadMsg = styled.span`
    width: 100%;
    text-align: center;
`;
