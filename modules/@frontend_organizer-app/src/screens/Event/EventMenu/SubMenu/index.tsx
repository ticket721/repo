import React, { useEffect, useState } from 'react';
import styled                         from 'styled-components';

import { useHistory }       from 'react-router';
import Icon                            from '@frontend/flib-react/lib/components/icon';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { useSelector }                 from 'react-redux';
import { MergedAppState }              from '../../../../index';
import { v4 }                          from 'uuid';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { CategoryEntity }              from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';

import { useTranslation }              from 'react-i18next';
import './locales';

export interface SubMenuProps {
    groupId: string;
    eventId: string;
    dateId: string;
    newDate: boolean;
}

export const SubMenu: React.FC<SubMenuProps> = ({ groupId, eventId, dateId, newDate}: SubMenuProps) => {
    const history = useHistory();
    const [activeTile, setActiveTile] = useState<string>(null);
    const [uuid] = useState<string>(v4() + '@event-submenu');
    const [ t ] = useTranslation(['event_sub_menu']);
    const [ showingInfos, setShowingInfos ] = useState<boolean>(false);
    const [ showingDateCategories, setShowingDateCategories ] = useState<boolean>(false);
    const [ showingGlobalCategories, setShowingGlobalCategories ] = useState<boolean>(false);

    const [ dateCategories, setDateCategories ] = useState<CategoryEntity[]>([]);
    const [ globalCategories, setGlobalCategories ] = useState<CategoryEntity[]>([]);
    const token = useSelector((state: MergedAppState) => state.auth.token.value);
    const { response: dateCategoriesResp } = useRequest<CategoriesSearchResponseDto>(
        {
            method: 'categories.search',
            args: [
                token,
                {
                    parent_id: {
                        $eq: dateId,
                    }
                },
            ],
            refreshRate: 5,
        },
        uuid
    );

    const { response: globalCategoriesResp } = useRequest<CategoriesSearchResponseDto>(
        {
            method: 'categories.search',
            args: [
                token,
                {
                    parent_id: {
                        $eq: eventId,
                    }
                },
            ],
            refreshRate: 5,
        },
        uuid
    );

    useEffect(() => {
        const MatchingSubPath = history.location.pathname.match(/([a-zA-Z0-9]|-)+$/);
        setActiveTile(MatchingSubPath && MatchingSubPath[0]);
    }, [history.location.pathname]);

    useEffect(() => {
        if (history.location.state) {
            setShowingInfos(history.location.state['showingInfos']);
            setShowingDateCategories(history.location.state['showingDateCategories']);
            setShowingGlobalCategories(history.location.state['showingGlobalCategories']);
        }
    }, [history.location.state]);

    useEffect(() => {
        if (dateCategoriesResp.data && dateCategoriesResp.data.categories.length > 0) {
            setDateCategories(dateCategoriesResp.data.categories);
        }
    },
    [dateCategoriesResp]);

    useEffect(() => {
            if (globalCategoriesResp.data && globalCategoriesResp.data.categories.length > 0) {
                setGlobalCategories(globalCategoriesResp.data.categories);
            }
        },
        [globalCategoriesResp]);

    return (
        <>
            <EditSection opened={showingInfos} disabled={newDate}>
                <TileHeader onClick={() => dateId && setShowingInfos(!showingInfos)}>
                    <Title>{t('information_title')}</Title>
                    <Icon icon='chevron' color='white' size='6px'/>
                </TileHeader>
                {
                    showingInfos ?
                        <Tiles>
                            <Tile
                            active={activeTile === 'general-infos'}
                            onClick={() => history.push(`/${groupId}/date/${dateId}/general-infos`, {
                                showingInfos,
                                showingDateCategories,
                                showingGlobalCategories,
                            })}>
                                {t('general_info_subtitle')}
                            </Tile>
                            <Tile
                            active={activeTile === 'styles'}
                            onClick={() => history.push(`/${groupId}/date/${dateId}/styles`, {
                                showingInfos,
                                showingDateCategories,
                                showingGlobalCategories,
                            })}>
                                {t('styles_subtitle')}
                            </Tile>
                            <Tile
                            active={activeTile === 'location'}
                            onClick={() => history.push(`/${groupId}/date/${dateId}/location`, {
                                showingInfos,
                                showingDateCategories,
                                showingGlobalCategories,
                            })}>
                                {t('location_subtitle')}
                            </Tile>
                        </Tiles> :
                        null
                }
            </EditSection>
            <EditSection opened={showingDateCategories} disabled={newDate}>
                <TileHeader onClick={() => dateId && setShowingDateCategories(!showingDateCategories)}>
                    <Title>{t('categories_title')}</Title>
                    <Icon icon='chevron' color='white' size='6px'/>
                </TileHeader>
                {
                    showingDateCategories ?
                        <Tiles>
                            {
                                dateCategories.map((category) => (
                                    <Tile
                                    key={category.id}
                                    active={activeTile === category.id}
                                    onClick={() => history.push(`/${groupId}/date/${dateId}/category/${category.id}`, {
                                        showingInfos,
                                        showingDateCategories,
                                        showingGlobalCategories,
                                    })}>
                                        {category.display_name}
                                    </Tile>
                                ))
                            }
                            <Tile
                            active={activeTile === 'category'}
                            key={'new-category'} onClick={() => history.push(`/${groupId}/date/${dateId}/category`, {
                                showingInfos,
                                showingDateCategories,
                                showingGlobalCategories,
                            })}>
                                {t('new_category_subtitle')}
                            </Tile>
                        </Tiles> :
                        null
                }
            </EditSection>
            <EditSection opened={showingGlobalCategories} disabled={newDate}>
                <TileHeader onClick={() => dateId && setShowingGlobalCategories(!showingGlobalCategories)}>
                    <Title>{t('global_categories_title')}</Title>
                    <Icon icon='chevron' color='white' size='6px'/>
                </TileHeader>
                {
                    showingGlobalCategories ?
                        <Tiles>
                            {
                                globalCategories.map((category) => (
                                    <Tile
                                        key={category.id + '-global'}
                                        active={activeTile === category.id}
                                        onClick={() => history.push(`/${groupId}/date/${dateId}/category/${category.id}`, {
                                            showingInfos,
                                            showingDateCategories,
                                            showingGlobalCategories,
                                        })}>
                                        {category.display_name}
                                    </Tile>
                                ))
                            }
                            <Tile
                                active={activeTile === 'category'}
                                key={'new-global-category'} onClick={() => history.push(`/${groupId}/date/${dateId}/category`, {
                                showingInfos,
                                showingDateCategories,
                                showingGlobalCategories,
                            })}>
                                {t('new_global_category_subtitle')}
                            </Tile>
                        </Tiles> :
                        null
                }
            </EditSection>
        </>
    );
};

const EditSection = styled.div<{ opened: boolean, disabled: boolean }>`
    display: flex;
    flex-direction: column;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    background-color: ${props => props.opened ? props.theme.componentColor : null};
    border-radius: ${props => props.theme.defaultRadius};
    padding: ${props => `${props.theme.regularSpacing} ${props.theme.biggerSpacing}`};
    margin-bottom: ${props => props.theme.smallSpacing};

    & > div:first-child > span:last-child {
        transform: ${props => props.opened ? 'rotateX(180deg)' : null};
        transition: 200ms transform;
    }
`;

const TileHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: inherit;
`;

const Title = styled.span`
    font-weight: 500;
    font-size: 13px;
    cursor: inherit;
    color: rgba(255, 255, 255, 0.9);
`;

const Tiles = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: ${props => props.theme.smallSpacing};
    margin-left: ${props => props.theme.regularSpacing};
`;

const Tile = styled.span<{ active?: boolean }>`
    font-weight: 500;
    font-size: 13px;
    cursor: inherit;
    margin: ${props => props.theme.smallSpacing} 0;
    color: ${(props) => props.active ? props.theme.textColor : props.theme.textColorDarker};

    &:last-child {
        margin: ${props => props.theme.smallSpacing} 0 0;
    }

    :hover {
        color: ${(props) => props.theme.textColor};
    }
`;
