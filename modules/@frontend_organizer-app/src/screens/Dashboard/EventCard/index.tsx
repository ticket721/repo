import React              from 'react';
import styled             from 'styled-components';
import { useTranslation } from 'react-i18next';

import { checkFormatDate, displayCompleteDate } from '@frontend/core/lib/utils/date';
import { formatEuro }     from '@frontend/core/lib/utils/price';

import { EventDashboard } from '../formatters';
import placeholderT721 from '@frontend/flib-react/lib/assets/media/placeholderT721.png';

import './locales';

export const EventCard: React.FC<EventDashboard> = (props: EventDashboard) => {
    const [ t ] = useTranslation('event_card');
    return (
        <StyledCard>
            <HoverFilter />
            <img src={props.covers ? props.covers[0] : placeholderT721} alt={'cover'}/>
            <Content>
                <Name>{props.name}</Name>
                <PriceAndDate color={props.colors ? props.colors[0] : '#'}>
                    <span>{formatEuro(props.startPrice || '0')}</span>
                    ·
                    <span>{
                        props.datesRange ?
                            displayCompleteDate(checkFormatDate(props.datesRange[0])) :
                            t('no_date')
                    }</span>
                </PriceAndDate>
                <Seats>{props.totalSeats ? props.totalSeats + ' ' + t('tickets_remaining') : t('no_category')}</Seats>
            </Content>
        </StyledCard>
    );
};

const HoverFilter = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, transparent, rgba(10, 8, 18, 0.85) 100%);
`;

const StyledCard = styled.div`
    position: relative;
    width: calc((100vw - 100px - (${props => props.theme.doubleSpacing} * 2)) / 3);
    height: calc((100vw - 100px - (${props => props.theme.doubleSpacing} * 2)) / 6);
    overflow: hidden;
    cursor: pointer;
    border-radius: ${props => props.theme.defaultRadius};

    & > img {
        width: 100%;
    }

    @media screen and (max-width: 1400px) {
        width: calc((100vw - 100px - ${props => props.theme.doubleSpacing}) / 2);
        height: calc((100vw - 100px - ${props => props.theme.doubleSpacing}) / 4);
    }

    @media screen and (max-width: 800px) {
        width: calc(100vw - 100px);
        height: calc((100vw - 100px) / 2);
    }
`;

const Content = styled.div`
    position: absolute;
    bottom: ${props => props.theme.biggerSpacing};
    left: ${props => props.theme.biggerSpacing};
    font-weight: 500;
`;

const Name = styled.span`
    text-transform: uppercase;
    font-size: 16px;
    font-weight: 600;
`;

const PriceAndDate = styled.div<{ color: string }>`
    display: flex;
    font-size: 15px;
    color: ${props => props.theme.textColorDark};
    margin: 8px 0 5px;

    & > span:first-child {
        padding-right: 4px;
        color: ${props => props.color};
    }

    & > span:last-child {
        padding-left: 4px;
    }
`;

const Seats = styled.span`
    font-size: 12px;
    font-weight: 500;
    color: ${props => props.theme.textColorDark};
`;
