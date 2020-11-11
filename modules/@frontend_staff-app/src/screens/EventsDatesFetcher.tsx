import React, { useState } from 'react';
import { useRequest }                   from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }       from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { EventsSearchResponseDto }      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { StaffAppState }                from '../redux';
import { useSelector }                  from 'react-redux';
import { Error, FullPageLoading, Icon } from '@frontend/flib-react/lib/components';
import styled                           from 'styled-components';
import { useTranslation }               from 'react-i18next';
import { formatDateItems }              from '../utils/formatDateItems';
import { EventSelection }               from '../components/EventSelection';
import { CategoriesFetcher }            from '../components/Filters/CategoriesFetcher';
import { isRequestError }               from '@frontend/core/lib/utils/isRequestError';

interface EventsDatesFetcherProps extends React.ComponentProps<any> {
    uuid: string;
    entities: string[];
}

export const EventsDatesFetcher: React.FC<EventsDatesFetcherProps> = ({ children, uuid, entities }: EventsDatesFetcherProps) => {
    const [ t ] = useTranslation(['fetch_errors', 'dropdown']);
    const [ token, dateName ] = useSelector((state: StaffAppState) => [ state.auth.token.value, state.currentEvent.dateName ]);
    const [ filterOpened, setFilterOpened ] = useState<boolean>(false);

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
                },
                parent_type: {
                    $eq: 'event'
                }
            }
        ],
        refreshRate: 5,
    }, uuid);

    if (eventsReq.response.loading || datesReq.response.loading) {
        return <FullPageLoading/>;
    }

    if (isRequestError(eventsReq)) {
        return <Error message={t('error_cannot_fetch_events')} retryLabel={t('common:retrying_in')} onRefresh={eventsReq.force}/>;
    }

    if (isRequestError(datesReq)) {
        return <Error message={t('error_cannot_fetch_dates')} retryLabel={t('common:retrying_in')} onRefresh={datesReq.force}/>;
    }

    if (eventsReq.response.data.events.length === 0 || datesReq.response.data.dates.length === 0) {
        return <NoEvent>{t('no_event')}</NoEvent>
    }

    return <>
        <FiltersContainer>
            <DropdownContainer>
                <span>{dateName || t('dropdown:choose_event')}</span>
                <EventSelection
                    events={eventsReq.response.data.events.map(event => ({
                        id: event.id,
                        name: event.name,
                    }))}
                    dates={formatDateItems(datesReq.response.data.dates)}/>
            </DropdownContainer>
            <div onClick={() => dateName ? setFilterOpened(true) : null}>
                <Icon icon={'filter'} size={'12px'} color={'#FFF'}/>
            </div>
        </FiltersContainer>
        {children}
        <CategoriesFetcher open={filterOpened} onClose={() => setFilterOpened(false)}/>
    </>;
};

const NoEvent = styled.span`
    width: 100%;
    text-align: center;
`;

const FiltersContainer = styled.div`
    display: flex;
    align-items: center;
`;

const DropdownContainer = styled.div`
    width: calc(100% - 40px);
    padding: ${props => props.theme.regularSpacing};

    & > span {
        display: block;
        margin-bottom: ${props => props.theme.smallSpacing};
        font-size: 13px;
        font-weight: 500;
        color: ${props => props.theme.textColorDark};
    }

    [class$=indicatorContainer] {
        display: none;
    }
`;
