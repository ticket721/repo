import React, { useContext, useEffect, useState } from 'react';
import { useRequest } from '@frontend/core/lib/hooks/useRequest';
import { EventsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { v4 } from 'uuid';
import { useToken } from  '@frontend/core/lib/hooks/useToken';
import { UserContext } from '@frontend/core/lib/utils/UserContext';
import { FullPageLoading, Error, Icon } from '@frontend/flib-react/lib/components';
import { useTranslation } from 'react-i18next';
import './locales';
import styled from 'styled-components';
import { useHistory } from 'react-router';

const NoEventsTitle = styled.span`
  font-size: 14px;
  opacity: 0.5;
  margin-left: 16px;
`

export const DashboardMenu: React.FC = () => {
    const [ t ] = useTranslation('dashboard_menu');
    const token = useToken();
    const [uuid] = useState<string>(v4() + '@events-search');
    const user = useContext(UserContext);

    const history = useHistory();

    const { response: eventsResp, force: forceEvents } = useRequest<EventsSearchResponseDto>({
        method: 'events.search',
        args: [
            token,
            {
                owner: {
                    $eq: user.id
                },
                $sort: [{
                    $field_name: 'updated_at',
                    $order: 'asc',
                }]
            },
        ],
        refreshRate: 50,
    }, uuid);

    useEffect(() => {
        forceEvents();
    // eslint-disable-next-line
    }, []);

    if (eventsResp.loading) {
        return <FullPageLoading/>;
    }

    if (eventsResp.error) {
        return <Error message={t('events_fetch_error')} onRefresh={forceEvents}/>;
    }

    return <DashboardMenuContainer>
        <Title>{t('dashboard_title')}</Title>
        {
            eventsResp.data.events.length > 0

            ?
            eventsResp.data.events.map(event => (
                <Link
                key={event.id}
                onClick={() => history.push(`/event/${event.id}`)}>
                    <span>{event.name}</span>
                    <Icon icon={'arrow'} size={'16px'} color={'white'}/>
                    </Link>
            ))

                :
                <NoEventsTitle>{t('no_events')}</NoEventsTitle>
        }
    </DashboardMenuContainer>;
}

const DashboardMenuContainer = styled.div`
    display: flex;
    flex-direction: column;
`;


const Title = styled.span`
    display: block;
    font-size: 20px;
    font-weight: 600;
    text-transform: uppercase;
    margin: ${props => props.theme.biggerSpacing} ${props => props.theme.regularSpacing} ${props => props.theme.regularSpacing};
`;

const Link = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    padding: ${props => props.theme.biggerSpacing};
    border-top: 1px solid ${props => props.theme.darkBg};

    span:first-child {
        padding-top: 6px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
    }

    span:last-child {
        opacity: 0;
        transition: opacity 200ms ease;
    }

    :hover {
        span:first-child {
            font-weight: 600;
        }

        span:last-child {
            opacity: 1;
        }
    }
`;
