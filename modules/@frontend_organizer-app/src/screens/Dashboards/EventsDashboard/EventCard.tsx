import React, { useContext, useMemo } from 'react';
import { useTranslation }  from 'react-i18next';
import styled from 'styled-components';
import { checkFormatDate, formatDay } from '@frontend/core/lib/utils/date';
import { useHistory } from 'react-router';
import { DatesContext } from '../../../components/Fetchers/DatesFetcher';

export interface EventCardProps {
    id: string;
    name: string;
    avatar: string;
    primaryColor: string;
}

export const EventCard: React.FC<EventCardProps> = ({ id, name, avatar, primaryColor }) => {
    const [ t ] = useTranslation('events_dashboard');

    const history = useHistory();

    const { dates } = useContext(DatesContext);

    const dateRange = useMemo<{ start: string, end: string }>(() => {
        const endDate = dates
            .map(date => date.timestamps.event_end)
            .sort((date, nextDate)  => checkFormatDate(nextDate).getTime() - checkFormatDate(date).getTime())[0];

        return {
            start: formatDay(dates[0].timestamps.event_begin),
            end: formatDay(endDate),
        }
    }, [dates]);

    return <Container>
        <Card
        cover={avatar}
        onClick={() => history.push(`/event/${id}`)}>
            <Filter/>
            <Content>
                <Name>{name}</Name>
                {
                    dates.length > 0 ?
                    <DateRange primaryColor={primaryColor}>
                        {t('from')}&nbsp;
                        <strong>{dateRange.start || '___'}</strong>
                        &nbsp;{t('to')}&nbsp;
                        <strong>{dateRange.end || '___'}</strong>
                    </DateRange> :
                    null
                }
            </Content>
        </Card>
    </Container>;
};

const Container = styled.div`
    width: calc((100vw - 450px - (${props => props.theme.doubleSpacing} * 2)) / 3);

    @media screen and (max-width: 1500px) {
        width: calc((100vw - 450px - ${props => props.theme.doubleSpacing}) / 2);
    }

    @media screen and (max-width: 1100px) {
        width: calc(100vw - 450px);
    }
`;

const Card = styled.div<{ cover: string }>`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 100%;
    background: url(${props => props.cover});
    background-size: cover;
    background-position: center;
    padding-top: 56.25%;
    border-radius: ${props => props.theme.defaultRadius};
    cursor: pointer;
    overflow: hidden;
    height: 0;
`;

const Filter = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    border-radius: ${props => props.theme.defaultRadius};
    width: 100%;
    height: 100%;
    background: linear-gradient(0deg, rgba(0,0,0,0.6) 15%, transparent);
`;

const Content = styled.div`
    position: absolute;
    bottom: ${props => props.theme.biggerSpacing};
    left: ${props => props.theme.biggerSpacing};
    display: flex;
    flex-direction: column;
`;

const Name = styled.span`
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: ${props => props.theme.smallSpacing};
    z-index: 1;
`;

const DateRange = styled.span<{ primaryColor: string }>`
    font-size: 14px;
    z-index: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: 500;
    width: 100%;

    strong {
        color: ${props => props.primaryColor};
        text-shadow: 0 0 1px ${props => props.primaryColor};
    }
`;
