import React, { useContext } from 'react';
import { useTranslation }  from 'react-i18next';
import { Button } from '@frontend/flib-react/lib/components';
import styled              from 'styled-components';
import './locales';
import { EventCard } from './EventCard';
import { useHistory } from 'react-router';
import { EventsContext } from '../../../components/Fetchers/EventsFetcher';
import { DatesFetcher } from '../../../components/Fetchers/DatesFetcher';

export const EventsView: React.FC = () => {
    const [ t ] = useTranslation('events_dashboard');

    const history = useHistory();

    const { events } = useContext(EventsContext);

    return (
        <EventsDashboardContainer>
            {
                events.length > 0 ?
                events.map(event =>
                    <DatesFetcher eventId={event.id}>
                        <EventCard
                        key={event.id}
                        id={event.id}
                        name={event.name}
                        avatar={event.avatar}
                        primaryColor={event.signature_colors[0]}
                        />
                    </DatesFetcher>
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
