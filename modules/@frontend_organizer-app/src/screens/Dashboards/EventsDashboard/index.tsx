import React, { useContext, useState } from 'react';
import { v4 }                         from 'uuid';

import { useRequest }              from '@frontend/core/lib/hooks/useRequest';

import { useTranslation }  from 'react-i18next';
import { FullPageLoading, Error, Button } from '@frontend/flib-react/lib/components';
import styled              from 'styled-components';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import { UserContext } from '@frontend/core/lib/utils/UserContext';
import { EventsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import './locales';
import { EventCard } from './EventCard';
import { useHistory } from 'react-router';

export const EventsDashboard: React.FC = () => {
    const [ t ] = useTranslation('events_dashboard');

    const history = useHistory();

    const [fetchEventsUuid] = useState(v4() + '@events-dashboard');
    const token = useToken();

    const { id: owner } = useContext(UserContext);

    const { response: eventsResp, force: forceEvents } = useRequest<EventsSearchResponseDto>({
        method: 'events.search',
        args: [
            token,
            {
                owner: {
                    $eq: owner
                },
                $sort: [{
                    $field_name: 'updated_at',
                    $order: 'desc',
                }]
            }
        ],
        refreshRate: 50
    }, fetchEventsUuid);

    if (eventsResp.loading) {
        return <FullPageLoading/>;
    }

    if (eventsResp.error) {
        return <Error message={t('events_fetch_error')} onRefresh={forceEvents}/>;
    }

    return (
        <EventsDashboardContainer>
            {
                eventsResp.data.events.length > 0 ?
                eventsResp.data.events.map(event =>
                    <EventCard
                    key={event.id}
                    id={event.id}
                    name={event.name}
                    avatar={event.avatar}
                    primaryColor={event.signature_colors[0]}
                    dateIds={event.dates}
                    />
                ) :
                <NoEvent>
                    <NoEventMsg>{t('no_event_msg')}</NoEventMsg>
                    <Button
                        style={{
                            width: 200
                        }}
                    title={t('create_event')}
                    variant={'primary'}
                    onClick={() => history.push('/create-event')}/>
                </NoEvent>
            }
        </EventsDashboardContainer>
    )
};

const EventsDashboardContainer = styled.div`
    width: calc(100% - 100px);
    display: flex;
    flex-wrap: wrap;

    & > div {
        margin-bottom: ${props => props.theme.doubleSpacing};
        margin-right: ${props => props.theme.doubleSpacing};
    }

    @media screen and (min-width: 1500px) {
        & > div:nth-child(3n+3) {
            margin-right: 0;
        }
    }

    @media screen and (max-width: 1500px) {
        & > div:nth-child(2n+2) {
            margin-right: 0;
        }
    }

    @media screen and (max-width: 1100px) {
        & > div {
            margin-right: 0;
        }
    }
`;

const NoEvent = styled.div`
    width: 100%;
    height: calc(100vh - 264px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    button {
        width: 280px;
    }
`;

const NoEventMsg = styled.span`
    color: ${props => props.theme.textColorDarker};
    margin-bottom: ${props => props.theme.biggerSpacing};
    font-weight: 400;
`;
