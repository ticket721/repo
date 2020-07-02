import React, { useState } from 'react';
import { useRequest }                 from '@frontend/core/lib/hooks/useRequest';
import { EventsSearchResponseDto }                                                     from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { DatesSearchResponseDto }                                                      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { CategoriesSearchResponseDto }                                                 from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { useDeepEffect }                                                               from '@frontend/core/lib/hooks/useDeepEffect';
import { EventDashboard, formatDatesAndCovers, formatEventName, formatPricesAndSeats } from './formatters';
import { EventCard }                                                                   from './EventCard';
import styled                                                                          from 'styled-components';
import { useHistory }                                                                  from 'react-router';

interface EventsFetcherProps {
    token: string;
    uuid: string;
    groupIds: string[];
}

export const EventsFetcher: React.FC<EventsFetcherProps> = ({ token, uuid, groupIds }) => {
    const history = useHistory();
    const [ formattedEvents, setFormattedEvents ] = useState<EventDashboard[]>([]);
    const { response: eventsResp } = useRequest<EventsSearchResponseDto>(
        {
            method: 'events.search',
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
            const filteredDates = datesResp.data.dates.filter(d => d.parent_type === 'event' || d.parent_type === 'date');
            if (filteredDates.length > 0) {
                setFormattedEvents(formatDatesAndCovers(filteredDates, formattedEvents));
            }
        }
    }, [formattedEvents.length, datesResp.data]);

    useDeepEffect(() => {
        if (
            formattedEvents.length > 0 &&
            formattedEvents[0].datesRange &&
            categoriesResp.data &&
            categoriesResp.data.categories.length > 0
        ) {
            setFormattedEvents(formatPricesAndSeats(categoriesResp.data.categories, formattedEvents));
        }
    }, [formattedEvents, categoriesResp.data]);

    return (
        <Cards>
            {
                (formattedEvents.length > 0 && formattedEvents[0].datesRange &&
                    formattedEvents.map((event) => (
                        <div
                        key={event.groupId}
                        onClick={() => history.push(`/group/${event.groupId}`)}>
                            <EventCard
                            {...event}/>
                        </div>
                    ))) || (formattedEvents.length === 0 && <span>You don't have any event</span>) ||
                    <span>Loading...</span>
            }
        </Cards>
    );
};

const Cards = styled.div`
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

    & > div {
        width: fit-content;
        margin: ${props => props.theme.regularSpacing} 0;
    }
`;
