import React              from 'react';
import { EventDashboard } from '../formatters';
import styled             from 'styled-components';
import { Icon }                                 from '@frontend/flib-react/lib/components';
import { checkFormatDate, displayCompleteDate } from '@frontend/core/lib/utils/date';

import { useTranslation } from 'react-i18next';
import './locales';

export const EventCard: React.FC<EventDashboard> = (props: EventDashboard) => {
    const [ t ] = useTranslation('event_card');
    return (
        <StyledCard>
            <HoverFilter />
            <img src={props.covers[0]} alt={'cover'}/>
            <Content>
                <Name>{props.name}</Name>
                <PriceAndSeats color={props.colors[0]}>
                    {
                        props.startPrice && props.totalSeats ?
                            <>
                                <span>{props.startPrice} €</span>
                                ·
                                <span>{props.totalSeats} {t('seats_remaining')}</span>
                            </> :
                            <span>{t('no_category')}</span>
                    }
                </PriceAndSeats>
                <DateRange>
                    <span>{displayCompleteDate(checkFormatDate(props.datesRange[0]))}</span>
                    <Icon
                        icon={'arrow'}
                        color={'#FFF'}
                        size={'16px'}/>
                    <span>{displayCompleteDate(checkFormatDate(props.datesRange[0]))}</span>
                </DateRange>
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
`;

const Name = styled.span`
    text-transform: uppercase;
    font-weight: 600;
`;

const PriceAndSeats = styled.div<{ color: string }>`
    display: flex;
    color: ${props => props.theme.componentColorLight};
    margin: 8px 0;

    & > span:first-child {
        color: ${props => props.color};
    }
`;

const DateRange = styled.div`
    display: flex;
    font-weight: 500;

    & > span:first-child, & > span:last-child {
        line-height: 20px;
    }

    & > span:nth-child(2) {
        margin: 0 ${props => props.theme.regularSpacing};
    }
`;
