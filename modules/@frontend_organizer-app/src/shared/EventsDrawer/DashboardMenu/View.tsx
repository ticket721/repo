import React, { useContext } from 'react';
import { Icon } from '@frontend/flib-react/lib/components';
import { useTranslation } from 'react-i18next';
import './locales';
import styled from 'styled-components';
import { useHistory } from 'react-router';
import { EventsContext } from '../../../components/Fetchers/EventsFetcher';

export const DashboardMenuView: React.FC = () => {
    const [ t ] = useTranslation('dashboard_menu');
    const { events } = useContext(EventsContext);

    const history = useHistory();

    return <DashboardMenuContainer>
        <Title>{t('dashboard_title')}</Title>
        {
            events.length > 0

            ?
            events.map(event => (
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

const NoEventsTitle = styled.span`
  font-size: 14px;
  opacity: 0.5;
  margin-left: 16px;
`;
