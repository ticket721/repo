import React, { useEffect, useState } from 'react';
import styled                         from 'styled-components';

import { useHistory, useParams } from 'react-router';
import Icon                      from '@frontend/flib-react/lib/components/icon';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { useSelector }                 from 'react-redux';
import { AppState } from '@frontend/core/lib/redux';
import { v4 }                          from 'uuid';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { CategoryEntity }              from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';

import { useTranslation }          from 'react-i18next';
import './locales';
import { useDeepEffect }           from '@frontend/core/lib/hooks/useDeepEffect';
import { EventsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';

export const GlobalSubMenu: React.FC = () => {
    const history = useHistory();
    const { groupId, eventId } = useParams();
    const [activeTile, setActiveTile] = useState<string>(null);
    const [uuid] = useState<string>(v4() + '@global-submenu');
    const [ t ] = useTranslation('global_sub_menu');
    const [ showingGlobalCategories, setShowingGlobalCategories ] = useState<boolean>(false);

    const [ globalCategories, setGlobalCategories ] = useState<CategoryEntity[]>([]);
    const token = useSelector((state: AppState) => state.auth.token.value);

    const { response: eventResp } = useRequest<EventsSearchResponseDto>(
        {
            method: 'events.search',
            args: [
                token,
                {
                    group_id: {
                        $eq: groupId,
                    },
                },
            ],
            refreshRate: 1,
        },
        uuid
    );

    const { response: globalCategoriesResp } = useRequest<CategoriesSearchResponseDto>(
        {
            method: 'categories.search',
            args: [
                token,
                {
                    group_id: {
                        $eq: groupId,
                    },
                    parent_type: {
                        $eq: 'event'
                    }
                },
            ],
            refreshRate: 1,
        },
        uuid
    );

    useEffect(() => {
        const MatchingSubPath = history.location.pathname.match(/([a-zA-Z0-9]|-)+$/);
        setActiveTile(MatchingSubPath && MatchingSubPath[0]);
    }, [history.location.pathname]);

    useEffect(() => {
        if (history.location.state) {
            setShowingGlobalCategories(history.location.state['showingGlobalCategories']);
        }
    }, [history.location.state]);

    useDeepEffect(() => {
            if (globalCategoriesResp.data) {
                setGlobalCategories(globalCategoriesResp.data.categories);
            }
        },
        [globalCategoriesResp.data]);

    useEffect(() => {
        if (eventId) {
            setShowingGlobalCategories(true);
        }
    }, [eventId]);

    return (
        <EditSection opened={showingGlobalCategories}>
            {
                !eventId ?
                    <TileHeader
                        opened={showingGlobalCategories}
                        onClick={() => setShowingGlobalCategories(!showingGlobalCategories)}>
                        <Title>{t('global_categories_title')}</Title>
                        <Icon icon='chevron' color='white' size='6px'/>
                    </TileHeader> :
                    null
            }
            {
                showingGlobalCategories ?
                    <Tiles globalCategories={!!eventId}>
                        {
                            globalCategories.map((category) => (
                                <Tile
                                    key={category.id + '-global'}
                                    active={activeTile === category.id}
                                    onClick={() => console.error('implement history.push')}>
                                    <span>{category.display_name}</span>
                                </Tile>
                            ))
                        }
                        {
                            eventResp.data?.events ?
                                <Tile
                                active={activeTile === 'category'}
                                key={'new-global-category'} onClick={() => history.push(`/group/${groupId}/event/${eventResp.data.events[0].id}/category`, {
                                showingGlobalCategories,
                                })}>
                                    {t('new_global_category_subtitle')}
                                </Tile> :
                                null
                        }
                    </Tiles> :
                    null
            }
        </EditSection>
    );
};

const EditSection = styled.div<{ opened: boolean }>`
    display: flex;
    flex-direction: column;
    background-color: ${props => props.opened ? props.theme.componentColor : null};
    border-radius: ${props => props.theme.defaultRadius};
    padding: ${props => `${props.theme.regularSpacing} ${props.theme.biggerSpacing}`};
    margin-bottom: ${props => props.theme.smallSpacing};
`;

const TileHeader = styled.div<{ opened: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    & > span:last-child {
        transform: ${props => props.opened ? 'rotateX(180deg)' : null};
        transition: 200ms transform;
    }
`;

const Title = styled.span`
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.9);
`;

const Tiles = styled.div<{ globalCategories: boolean }>`
    display: flex;
    flex-direction: column;
    margin-top: ${props => (props.globalCategories ? '-' : '') + props.theme.smallSpacing};
    margin-left: ${props => props.theme.regularSpacing};
`;

const Tile = styled.span<{ active?: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    margin: ${props => props.theme.smallSpacing} 0;
    color: ${(props) => props.active ? props.theme.textColor : props.theme.textColorDarker};

    &:last-child {
        margin: ${props => props.theme.smallSpacing} 0 0;
    }

    :hover {
        color: ${(props) => props.theme.textColor};
    }
`;
