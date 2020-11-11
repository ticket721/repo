import { useRequest } from '@frontend/core/lib/hooks/useRequest';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import { FullPageLoading, Error } from '@frontend/flib-react/lib/components';
import React, { useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { useTranslation }  from 'react-i18next';
import styled from 'styled-components';
import { useHistory, useParams } from 'react-router';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { eventParam } from '../../types';
import { OnlineTag } from '../../../components/OnlineTag';

export interface DateCardProps {
    id: string;
    name: string;
    online: boolean;
    avatar: string;
    primaryColor: string;
    categoryIds: string[];
}

export const DateCard: React.FC<DateCardProps> = ({ id, name, online, avatar, primaryColor, categoryIds }) => {
    const [ t ] = useTranslation('dates_dashboard');
    const token = useToken();

    const history = useHistory();

    const { eventId } = useParams<eventParam>();

    const [fetchCategoriesUuid] = useState(v4() + '@dates-fetch');

    const [ categoriesInfos, setCategoriesInfos ] = useState<{ startPrice: number, totalSeats: number }>();

    const { response: categoriesResp, force: forceCategories } = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [
            token,
            {
                id: {
                    $in: categoryIds
                },
                $sort: [{
                    $field_name: 'price',
                    $order: 'asc',
                }]
            },
        ],
        refreshRate: 50,
    }, fetchCategoriesUuid);

    useEffect(() => {
        if (categoriesResp.data?.categories.length > 0) {
            const totalSeats = categoriesResp.data.categories.reduce((acc, category) => acc + category.seats, 0);
            setCategoriesInfos({
                startPrice: categoriesResp.data.categories[0].price,
                totalSeats,
            });
        }
    // eslint-disable-next-line
    }, [categoriesResp.data?.categories]);

    if (categoriesResp.loading) {
        return <FullPageLoading/>;
    }

    if (categoriesResp.error) {
        return <Error message={t('categories_fetch_error')} onRefresh={forceCategories}/>;
    }

    return <DateCardContainer
    cover={avatar}
    onClick={() => history.push(`/event/${eventId}/date/${id}/dates-typology`)}>
            <Filter/>
            {
                online ?
                <Online><OnlineTag/></Online> :
                null
            }
            <Name>{name}</Name>
            {
                categoriesResp.data.categories.length > 0 ?
                <CategoriesInfos primaryColor={primaryColor}>
                    <strong>{categoriesInfos?.totalSeats}</strong>&nbsp;{t('seats')}&nbsp;•&nbsp;
                    {
                        categoriesInfos?.startPrice > 0 ?
                        <>{t('from')}&nbsp;<strong>{categoriesInfos.startPrice/100}€</strong></> :
                        <strong>{t('free')}</strong>
                    }
                </CategoriesInfos> :
                null
            }
    </DateCardContainer>;
};

const DateCardContainer = styled.div<{ cover: string }>`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 400px;
    width: calc((100vw - 450px - (${props => props.theme.doubleSpacing} * 2)) / 3);
    height: calc((100vw - 450px - (${props => props.theme.doubleSpacing} * 2)) * (3/16));
    background: url(${props => props.cover});
    background-size: cover;
    padding: ${props => props.theme.biggerSpacing};
    border-radius: ${props => props.theme.defaultRadius};
    cursor: pointer;

    @media screen and (max-width: 1500px) {
        width: calc((100vw - 450px - ${props => props.theme.doubleSpacing}) / 2);
        height: calc((100vw - 450px - ${props => props.theme.doubleSpacing}) * (9/32));
    }

    @media screen and (max-width: 900px) {
        width: calc(100vw - 450px);
        height: calc((100vw - 450px) * (9/16));
    }
`;

const Filter = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    border-radius: ${props => props.theme.defaultRadius};
    width: 100%;
    height: 100%;
    background: linear-gradient(0deg, rgba(0,0,0,0.6) 15%, transparent);
`;

const Online = styled.div`
    position: absolute;
    top: ${props => props.theme.regularSpacing};
    right: ${props => props.theme.regularSpacing};
`;

const Name = styled.span`
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: ${props => props.theme.smallSpacing};
    z-index: 1;
`;

const CategoriesInfos = styled.span<{ primaryColor: string }>`
    font-size: 14px;
    z-index: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: 500;

    strong {
        color: ${props => props.primaryColor};
        text-shadow: 0 0 1px ${props => props.primaryColor};
    }
`;
