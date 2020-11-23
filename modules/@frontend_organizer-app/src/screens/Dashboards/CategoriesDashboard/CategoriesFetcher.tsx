import React, { useEffect, useState } from 'react';
import { v4 }                         from 'uuid';

import { useRequest }              from '@frontend/core/lib/hooks/useRequest';

import { useTranslation }  from 'react-i18next';
import './locales';
import { FullPageLoading, Error, Button } from '@frontend/flib-react/lib/components';
import styled              from 'styled-components';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import './locales';
import { CategoryCard } from '../../../components/CategoryCard';
import { useHistory } from 'react-router';
import { DateEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { PreviewBanner } from '../../../components/PreviewBanner';

export interface CategoriesFetcherProps {
    eventId: string;
    eventName: string;
    groupId: string;
    dates: DateEntity[];
}
export const CategoriesFetcher: React.FC<CategoriesFetcherProps> = ({ eventId, eventName, groupId, dates }) => {
    const [ t ] = useTranslation('categories_dashboard');

    const history = useHistory();

    const [fetchCategoriesUuid] = useState(v4() + '@categories-dashboard');
    const token = useToken();

    const { response: categoriesResp, force: forceCategories } = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [
            token,
            {
                group_id: {
                    $eq: groupId
                },
            }
        ],
        refreshRate: 50
    }, fetchCategoriesUuid);

    useEffect(() => {
        forceCategories();
    // eslint-disable-next-line
    }, []);

    if (categoriesResp.loading) {
        return <FullPageLoading/>;
    }

    if (categoriesResp.error) {
        return <Error message={t('categories_fetch_error')} onRefresh={forceCategories}/>;
    }

    return (
        <CategoriesDashboardContainer>
            <PreviewBanner/>
            <Title>{t('categories_of')}&nbsp;<strong>{eventName}</strong></Title>
            {
                categoriesResp.data.categories.filter(category => category.dates.length > 1).length > 0 ?
                categoriesResp.data.categories.filter(category => category.dates.length > 1).map(category =>
                    <CategoryCard
                    key={category.id}
                    id={category.id}
                    name={category.display_name}
                    link={`/event/${eventId}/category/${category.id}`}
                    seats={category.seats}
                    price={category.price}
                    datesInfos={
                        dates
                        .filter(date => category.dates.includes(date.id))
                        .map(date => ({
                            cover: date.metadata.avatar,
                            primaryColor: date.metadata.signature_colors[0]
                        }))
                    }
                    />
                ) :
                <NoMultiDatesCategory>
                    <NoCategoryMsg>{t('no_category_msg')}</NoCategoryMsg>
                    <Button
                    title={t('create_category')}
                    variant={'primary'}
                    onClick={() => history.push(`/event/${eventId}/category`)}/>
                </NoMultiDatesCategory>
            }
        </CategoriesDashboardContainer>
    )
};

const CategoriesDashboardContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    font-weight: 500;

    & > div {
        margin-bottom: ${props => props.theme.doubleSpacing};
    }
`;

const Title = styled.span`
    width: 100%;
    font-size: 20px;
    margin-bottom: ${props => props.theme.doubleSpacing};

    strong {
        text-transform: uppercase;
    }
`;

const NoMultiDatesCategory = styled.div`
    width: 100%;
    height: calc(100vh - 264px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    button {
        width: 280px;
    }
`;

const NoCategoryMsg = styled.span`
    color: ${props => props.theme.textColorDarker};
    margin-bottom: ${props => props.theme.biggerSpacing};
    font-weight: 400;
`;
