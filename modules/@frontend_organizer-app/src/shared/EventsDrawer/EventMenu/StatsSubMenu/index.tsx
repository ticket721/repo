import React from 'react';
import { useTranslation } from 'react-i18next';
import './locales';
import { useHistory } from 'react-router';
import styled from 'styled-components';
import { motion } from 'framer';

export interface StatusSubMenuProps {
    eventId: string;
}

export const StatsSubMenu: React.FC<StatusSubMenuProps> = ({eventId}: StatusSubMenuProps) => {
    const [ t ] = useTranslation('stats_submenu');

    const history = useHistory();

    return <CategoriesMenuContainer>
        <Header
            focused={history.location.pathname.endsWith('/stats')}
            onClick={(e) => {
                history.push(`/event/${eventId}/stats`);
            }}>
            <Title>
                {t('stats_title')}
            </Title>
        </Header>
        <StatsContainer
            statsCount={1}
        >
            <Link
                key={'attendees'}
                selected={history.location.pathname.endsWith('/attendees')}
                onClick={() => history.push(`/event/${eventId}/attendees`)}>
                <span>{t('attendees_title')}</span>
                {
                    history.location.pathname.endsWith('/attendees')

                        ?
                        <Arrow layoutId={'selected'}/>

                        :
                        null
                }
            </Link>
        </StatsContainer>
    </CategoriesMenuContainer>;
}

const CategoriesMenuContainer = styled.div`
    margin-top: ${props => props.theme.regularSpacing};
    background-color: ${props => props.theme.darkBg};
    border-radius: ${props => props.theme.defaultRadius};
    padding: ${props => props.theme.biggerSpacing} ${props => props.theme.biggerSpacing} calc(${props => props.theme.biggerSpacing} / 2);
`;

const Header = styled.div<{ focused: boolean }>`
    display: flex;
    justify-content: space-between;
    color: ${props => props.focused ? props.theme.textColor : props.theme.textColorDarker};
    padding-bottom: calc(${props => props.theme.biggerSpacing} / 2);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
`;

const StatsContainer = styled.div<{ statsCount: number }>`
    overflow: hidden;
    height: ${props => 36 * props.statsCount}px;
    border-top: 1px solid ${props => props.theme.componentColorLighter};
    padding: ${props => props.theme.smallSpacing} 0 0;
    margin-top: ${props => props.theme.smallSpacing};
    transition: height 300ms ease, padding 300ms ease;
    box-sizing: content-box;
`;

const Title = styled.div`
    display: flex;
    align-items: center;

    div {
        margin-left: ${props => props.theme.smallSpacing};
    }
`;

const Link = styled.div<{ selected: boolean }>`
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: calc(${props => props.theme.biggerSpacing} / 2) 0 calc(${props => props.theme.biggerSpacing} / 2) ${props => props.theme.regularSpacing};
    color: ${props => props.selected ? props.theme.textColor : props.theme.textColorDarker};
    font-size: 14px;
    font-weight: 600;
`;

const Arrow = styled(motion.div)`
    position: absolute;
    right: 0;
    width: 0;
    height: 0;
    border-top: 12px solid transparent;
    border-bottom: 12px solid transparent;
    border-right: 12px solid #0c0915;
`;
