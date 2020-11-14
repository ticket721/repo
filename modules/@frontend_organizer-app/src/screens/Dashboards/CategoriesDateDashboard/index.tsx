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
import { useHistory, useParams } from 'react-router';
import { eventParam, dateParam } from '../../types';
import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { PreviewBanner } from '../../../components/PreviewBanner';

export const CategoriesDateDashboard: React.FC = () => {
    const [ t ] = useTranslation('categories_date_dashboard');

    const history = useHistory();

    const [fetchDatesUuid] = useState(v4() + '@dates-dashboard');
    const [fetchCategoriesUuid] = useState(v4() + '@categories-dashboard');
    const token = useToken();

    const { eventId, dateId } = useParams<eventParam & dateParam>();

    const { response: datesResp, force: forceDates } = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                event: {
                    $eq: eventId
                },
            }
        ],
        refreshRate: 50
    }, fetchDatesUuid);

    const { response: categoriesResp, force: forceCategories } = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [
            token,
            {
                dates: {
                    $contains: dateId
                },
                $sort: [{
                    $field_name: 'created_at',
                    $order: 'asc',
                }]
            }
        ],
        refreshRate: 50
    }, fetchCategoriesUuid);

    useEffect(() => {
        forceDates();
        forceCategories();
    // eslint-disable-next-line
    }, []);

    if (datesResp.loading || categoriesResp.loading) {
        return <FullPageLoading/>;
    }

    if (datesResp.error) {
        return <Error message={t('dates_fetch_error')} onRefresh={forceDates}/>;
    }

    if (categoriesResp.error) {
        return <Error message={t('categories_fetch_error')} onRefresh={forceCategories}/>;
    }

    return (
        <CategoriesDashboardContainer>
            <PreviewBanner/>
            <Title>{t('categories_of')}&nbsp;<strong>{datesResp.data.dates.find(date => date.id === dateId).metadata.name}</strong></Title>
            {
                categoriesResp.data.categories.length > 0 ?
                categoriesResp.data.categories.map(category =>
                    <CategoryCard
                    key={category.id}
                    id={category.id}
                    name={category.display_name}
                    link={`/event/${eventId}/date/${dateId}/category/${category.id}`}
                    seats={category.seats}
                    price={category.price}
                    datesInfos={
                        datesResp.data.dates
                        .filter(date => category.dates.includes(date.id))
                        .map(date => ({
                            cover: date.metadata.avatar,
                            primaryColor: date.metadata.signature_colors[0]
                        }))
                    }
                    />
                ) :
                <NoCategory>
                    <NoCategoryMsg>{t('no_category_msg')}</NoCategoryMsg>
                    <Button
                    title={t('create_category')}
                    variant={'primary'}
                    onClick={() => history.push(`/event/${eventId}/date/${dateId}/category`)}/>
                </NoCategory>
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

const NoCategory = styled.div`
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
