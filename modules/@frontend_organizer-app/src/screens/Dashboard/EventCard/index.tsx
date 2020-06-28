import React              from 'react';
import { EventDashboard } from '../formatters';
import styled             from 'styled-components';
import { checkFormatDate, displayCompleteDate } from '@frontend/core/lib/utils/date';

import { useTranslation } from 'react-i18next';
import './locales';
import { formatEuro }     from '@frontend/core/lib/utils/price';

export const EventCard: React.FC<EventDashboard> = (props: EventDashboard) => {
    const [ t ] = useTranslation('event_card');
    return (
        <StyledCard>
            <HoverFilter />
            <img src={props.covers[0]} alt={'cover'}/>
            <Content>
                <Name>{props.name}</Name>
                <PriceAndDate color={props.colors[0]}>
                    {
                        props.startPrice && props.totalSeats ?
                            <>
                                <span>{formatEuro(props.startPrice)}</span>
                                ·
                                <span>{displayCompleteDate(checkFormatDate(props.datesRange[0]))}</span>
                            </> :
                            <span>{t('no_category')}</span>
                    }
                </PriceAndDate>
                <Seats>{props.totalSeats} {t('tickets_remaining')}</Seats>
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
    width: calc(50vw - 75px);
    height: calc(25vw - 37px);
    overflow: hidden;
    cursor: pointer;
    border-radius: ${props => props.theme.defaultRadius};

    & > img {
        width: 100%;
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
