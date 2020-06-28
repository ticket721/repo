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
    const { dateId } = useParams();
    const [uuid] = useState<string>(v4() + '@event-submenu');
    const [ t ] = useTranslation(['event_sub_menu']);
    const [ isShowingInfos, setIsShowingInfos ] = useState<boolean>(false);
    const [ isShowingCategories, setIsShowingCategories ] = useState<boolean>(false);

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
        if (categoriesResp.data && categoriesResp.data.categories.length > 0) {
            setCategories(categoriesResp.data.categories);
        }
    },
    [categoriesResp]);
    return (
        <>
            <TilesContainer>
                <div onClick={() => setIsShowingInfos(!isShowingInfos)}>
                    <Title>{t('information_title')}</Title>
                    <Icon icon='chevron' color='white' size='6px'/>
                </div>
                {
                    isShowingInfos ?
                        <div>
                            <Tile onClick={() => history.push('general-infos')}>
                                {t('general_info_subtitle')}
                            </Tile>
                            <Tile onClick={() => history.push('styles')}>
                                {t('styles_subtitle')}
                            </Tile>
                            <Tile onClick={() => history.push('location')}>
                                {t('location_subtitle')}
                            </Tile>
                        </div> :
                        null
                }
            </TilesContainer>
            <TilesContainer>
                <div onClick={() => setIsShowingCategories(!isShowingCategories)}>
                    <Title>{t('categories_title')}</Title>
                    <Icon icon='chevron' color='white' size='6px'/>
                </div>
                {
                    isShowingCategories ?
                        <div>
                            {
                                categories.map((category) => (
                                    <Tile key={category.id} onClick={() => history.push(`category/${category.id}`)}>
                                        {category.display_name}
                                    </Tile>
                                ))
                            }
                            <Tile key={'new-category'} onClick={() => history.push('category')}>
                                {t('new_category_subtitle')}
                            </Tile>
                        </div> :
                        null
                }
            </TilesContainer>
        </>
    );
};

const TilesContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 12px 0;
  margin-bottom: 12px;
`;

const Title = styled.span`
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  margin: 12px 0 12px 24px;
  color: rgba(255, 255, 255, 0.9);
`;

const Tile = styled.span`
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  margin: 8px 0 8px 40px;
  color: ${(props) => props.theme.textColorDarker};
`;
