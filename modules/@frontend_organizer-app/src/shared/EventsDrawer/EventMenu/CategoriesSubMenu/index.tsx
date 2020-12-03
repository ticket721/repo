import React, { useState } from 'react';
import { Icon } from '@frontend/flib-react/lib/components';
import { useTranslation } from 'react-i18next';
import './locales';
import { useHistory, useRouteMatch } from 'react-router';
import { categoryParam, eventParam } from '../../../../screens/types';
import styled from 'styled-components';
import { motion } from 'framer';
import { MultiDatesTag } from '../../../../components/MultiDatesTag';
import { useDeepEffect } from '@frontend/core/lib/hooks/useDeepEffect';
import { CategoryEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';

export interface CategoriesSubMenuProps {
    categories: CategoryEntity[];
    dateCount: number;
}

export const CategoriesSubMenu: React.FC<CategoriesSubMenuProps> = ({ categories, dateCount }) => {
    const [ t ] = useTranslation('categories_submenu');

    const match = useRouteMatch<eventParam & categoryParam>([
        '/event/:eventId/category/:categoryId',
        '/event/:eventId']);

    const [  params, setParams ] = useState<eventParam & categoryParam>();

    const history = useHistory();

    const [ collapsed, setCollapsed ] = useState<boolean>(
        !history.location.pathname.endsWith('/categories') &&
        !history.location.pathname.includes('/category')
    );

    useDeepEffect(() => {
        if (match?.params) {
            setParams(match.params);
        }
    }, [match?.params]);

    return <CategoriesMenuContainer>
        <Header
        focused={!collapsed}
        onClick={(e) => {
            if ((e.target as any).className.includes('chevron')) {
                if (!collapsed) {
                    history.push(`/event/${params.eventId}`);
                } else {
                    history.push(`/event/${params.eventId}/categories`);
                }
                setCollapsed(!collapsed);
            } else {
                if (collapsed && categories.length > 0) {
                    setCollapsed(false);
                }

                history.push(`/event/${params.eventId}/categories`);
            }
        }}>
            <Title>
                {t('categories_title')}
                {
                    dateCount > 1 ?
                    <MultiDatesTag/> :
                    null
                }
            </Title>
            {
                categories.filter(category => dateCount > 1 ? category.dates.length > 1 : true).length > 0 ?
                    <Chevron
                    className={'chevron'}
                    rotate={
                        history.location.pathname.endsWith('/categories') ?
                        'right' :
                        collapsed ?
                        'top' :
                        'bottom'
                    }>
                        <Icon className={'chevron'} icon={'chevron'} size={'8px'} color={'white'}/>
                    </Chevron> :
                    null
            }
        </Header>
        <CategoriesContainer
        collapsed={collapsed}
        categoriesCount={
            categories
            .filter(category => dateCount > 1 ? category.dates.length > 1 : true).length
        }>
            {
                categories
                .filter(category => dateCount > 1 ? category.dates.length > 1 : true)
                .map(category => (
                    <Link
                    key={category.id}
                    selected={params?.categoryId === category.id}
                    onClick={() => history.push(`/event/${params.eventId}/category/${category.id}`)}>
                        <span>{category.display_name}</span>
                        {
                            params?.categoryId === category.id && !collapsed ?
                            <Arrow layoutId={'selected'}/> :
                            null
                        }
                    </Link>
                ))
            }
        </CategoriesContainer>
        <NewCategoryLink
        key={'new-category'}
        selected={history.location.pathname.endsWith('/category')}
        onClick={() => {
            setCollapsed(false);
            history.push(`/event/${params.eventId}/category`);
        }}>
            <Plus>+</Plus>
            <span>{t('new_category')}</span>
            {
                history.location.pathname.endsWith('/category') ?
                    <Arrow layoutId={'selected'}/> :
                null
            }
        </NewCategoryLink>
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

const Title = styled.div`
    display: flex;
    align-items: center;

    div {
        margin-left: ${props => props.theme.smallSpacing};
    }
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

const CategoriesContainer = styled.div<{ collapsed: boolean, categoriesCount: number }>`
    overflow: ${props => props.collapsed ? 'hidden' : 'visible'};
    height: ${props => props.collapsed ? 0 : `${36 * props.categoriesCount}px`};
    border-top: 1px solid ${props => props.theme.componentColorLighter};
    padding: ${props => props.collapsed ? 0 : props.theme.smallSpacing} 0 0;
    margin-top: ${props => props.theme.smallSpacing};
    transition: height 300ms ease, padding 300ms ease;
    box-sizing: content-box;
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

const NewCategoryLink = styled.div<{ selected: boolean }>`
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
