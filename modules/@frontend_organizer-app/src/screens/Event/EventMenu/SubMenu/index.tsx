import React, { useEffect, useState } from 'react';
import styled                         from 'styled-components';

import { useHistory, useParams }       from 'react-router';
import Icon                            from '@frontend/flib-react/lib/components/icon';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { useSelector }                 from 'react-redux';
import { MergedAppState }              from '../../../../index';
import { v4 }                          from 'uuid';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { CategoryEntity }              from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';

import { useTranslation }              from 'react-i18next';
import './locales';

export const SubMenu: React.FC = () => {
    const history = useHistory();
    const { groupId, dateId } = useParams();
    const [activeTile, setActiveTile] = useState<string>(null);
    const [uuid] = useState<string>(v4() + '@event-submenu');
    const [ t ] = useTranslation(['event_sub_menu']);
    const [ showingInfos, setShowingInfos ] = useState<boolean>(false);
    const [ showingCategories, setShowingCategories ] = useState<boolean>(false);

    const [ categories, setCategories ] = useState<CategoryEntity[]>([]);
    const token = useSelector((state: MergedAppState) => state.auth.token.value);
    const { response: categoriesResp } = useRequest<CategoriesSearchResponseDto>(
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

    useEffect(() => {
        const MatchingSubPath = history.location.pathname.match(/([a-zA-Z0-9]|-)+$/);
        setActiveTile(MatchingSubPath && MatchingSubPath[0]);
    }, [history.location.pathname]);

    useEffect(() => {
        if (history.location.state) {
            setShowingInfos(history.location.state['showingInfos']);
            setShowingCategories(history.location.state['showingCategories']);
        }
    }, [history.location.state]);

    useEffect(() => {
        if (categoriesResp.data && categoriesResp.data.categories.length > 0) {
            setCategories(categoriesResp.data.categories);
        }
    },
    [categoriesResp]);

    return (
        <>
            <EditSection opened={showingInfos} disabled={!dateId}>
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
                                showingCategories
                            })}>
                                {t('general_info_subtitle')}
                            </Tile>
                            <Tile
                            active={activeTile === 'styles'}
                            onClick={() => history.push(`/${groupId}/date/${dateId}/styles`, {
                                showingInfos,
                                showingCategories
                            })}>
                                {t('styles_subtitle')}
                            </Tile>
                            <Tile
                            active={activeTile === 'location'}
                            onClick={() => history.push(`/${groupId}/date/${dateId}/location`, {
                                showingInfos,
                                showingCategories
                            })}>
                                {t('location_subtitle')}
                            </Tile>
                        </Tiles> :
                        null
                }
            </EditSection>
            <EditSection opened={showingCategories} disabled={!dateId}>
                <TileHeader onClick={() => dateId && setShowingCategories(!showingCategories)}>
                    <Title>{t('categories_title')}</Title>
                    <Icon icon='chevron' color='white' size='6px'/>
                </TileHeader>
                {
                    showingCategories ?
                        <Tiles>
                            {
                                categories.map((category) => (
                                    <Tile
                                    key={category.id}
                                    active={activeTile === category.id}
                                    onClick={() => history.push(`/${groupId}/date/${dateId}/category/${category.id}`, {
                                        showingInfos,
                                        showingCategories
                                    })}>
                                        {category.display_name}
                                    </Tile>
                                ))
                            }
                            <Tile
                            active={activeTile === 'category'}
                            key={'new-category'} onClick={() => history.push(`/${groupId}/date/${dateId}/category`, {
                                showingInfos,
                                showingCategories
                            })}>
                                {t('new_category_subtitle')}
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
