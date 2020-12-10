import React, { useState } from 'react';
import { Icon } from '@frontend/flib-react/lib/components';
import { useTranslation } from 'react-i18next';
import './locales';
import { useHistory } from 'react-router';
import styled from 'styled-components';
import { motion } from 'framer';
import { DateEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';

export interface DatesSubMenuProps {
    eventId: string;
    dates: DateEntity[];
}

export const DatesSubMenu: React.FC<DatesSubMenuProps> = ({ eventId, dates }) => {
    const [ t ] = useTranslation('dates_submenu');

    const history = useHistory();

    const [ collapsed, setCollapsed ] = useState<boolean>(false);

    return <DatesMenuContainer>
        <Title
        focused={!collapsed}
        onClick={(e) => {
            if ((e.target as any).className.includes('chevron')) {
                if (!collapsed) {
                    history.push(`/event/${eventId}/edit`);
                } else {
                    history.push(`/event/${eventId}`);
                }
                setCollapsed(!collapsed);
            } else {
                if (collapsed && dates.length > 0) {
                    setCollapsed(false);
                }

                history.push(`/event/${eventId}`);
            }
        }}>
            {t('dates_title')}
            {
                dates.length > 0 ?
                    <Chevron
                    className={'chevron'}
                    rotate={
                        collapsed ?
                        'top' :
                        history.location.pathname === `/event/${eventId}` ?
                        'right' :
                        'bottom'
                    }>
                        <Icon className={'chevron'} icon={'chevron'} size={'8px'} color={'white'}/>
                    </Chevron> :
                    null
            }
        </Title>
        <DatesContainer
        collapsed={collapsed}
        categoriesCount={dates.length}>
            {
                dates
                .map(date => (
                    <Link
                    key={date.id}
                    onClick={() => history.push(`/event/${eventId}/date/${date.id}/dates-typology`)}>
                        <span>{date.metadata.name}</span>
                        <Icon className={'arrow'} icon={'arrow'} size={'16px'} color={'white'}/>
                    </Link>
                ))
            }
        </DatesContainer>
        <NewDateLink
        key={'new-date'}
        selected={history.location.pathname.endsWith('/date')}
        onClick={() => {
            setCollapsed(false);
            history.push(`/event/${eventId}/date`);
        }}>
            <Plus>+</Plus>
            <span>{t('new_date')}</span>
            {
                history.location.pathname.endsWith('/date') ?
                    <Arrow layoutId={'selected'}/> :
                null
            }
        </NewDateLink>
    </DatesMenuContainer>;
}

const DatesMenuContainer = styled.div`
    background-color: ${props => props.theme.darkBg};
    border-radius: ${props => props.theme.defaultRadius};
    padding: ${props => props.theme.biggerSpacing} ${props => props.theme.biggerSpacing} calc(${props => props.theme.biggerSpacing} / 2);
`;

const Title = styled.div<{ focused: boolean }>`
    display: flex;
    justify-content: space-between;
    color: ${props => props.focused ? props.theme.textColor : props.theme.textColorDarker};
    padding-bottom: calc(${props => props.theme.biggerSpacing} / 2);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
`;

const Chevron = styled.div<{ rotate: 'top' | 'right' | 'bottom' }>`
    display: flex;
    align-items: center;
    transition: transform 300ms ease;
    ${props => {
        switch(props.rotate) {
            case 'right':
                return 'transform: rotateZ(-90deg);';
            case 'top':
                return 'transform: rotateX(180deg);';
            default: return null;
        }
    }}
`;

const DatesContainer = styled.div<{ collapsed: boolean, categoriesCount: number }>`
    overflow: ${props => props.collapsed ? 'hidden' : 'visible'};
    height: ${props => props.collapsed ? 0 : `${36 * props.categoriesCount}px`};
    border-top: 1px solid ${props => props.theme.componentColorLighter};
    padding: ${props => props.collapsed ? 0 : props.theme.smallSpacing} 0 0;
    margin-top: ${props => props.theme.smallSpacing};
    transition: height 300ms ease, padding 300ms ease;
    box-sizing: content-box;
`;

const Link = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: ${props => `
        calc(${props.theme.biggerSpacing} / 2)
        ${props.theme.regularSpacing}
        calc(${props.theme.biggerSpacing} / 2)
        ${props.theme.regularSpacing}
    `};
    color: ${props => props.theme.textColorDarker};
    text-transform: uppercase;
    font-size: 14px;
    font-weight: 500;

    .arrow {
        opacity: 0;
    }

    :hover {
        color: ${props => props.theme.textColor};

        .arrow {
            opacity: 1;
        }
    }

`;

const NewDateLink = styled.div<{ selected: boolean }>`
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: ${props => props.theme.biggerSpacing} 0 calc(${props => props.theme.biggerSpacing} / 2);
    color: ${props => props.selected ? props.theme.textColor : props.theme.textColorDarker};
    font-size: 14px;
    font-weight: 500;
`;

const Plus = styled.div`
    font-size: 20px;
    margin-right: ${props => props.theme.smallSpacing};
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
