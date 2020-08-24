import React, { useState } from 'react';
import { useRequest }       from '@frontend/core/lib/hooks/useRequest';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { useSelector }    from 'react-redux';
import { T721AppState }                from '../../../redux';
import { useTranslation }         from 'react-i18next';
import { Error, FullPageLoading } from '@frontend/flib-react/lib/components';
import { Redirect }               from 'react-router';
import { DatesFetcher }                 from './DatesFetcher';
import { v4 } from 'uuid';

interface CategoryFetcherProps {
    categoryId: string;
    ticketId: string;
    transactionHash: string;
    purchasedDate: Date;
}

export const CategoryFetcher: React.FC<CategoryFetcherProps> = ({
    categoryId,
    ticketId,
    transactionHash,
    purchasedDate }: CategoryFetcherProps) => {
    const token = useSelector((state: T721AppState) => state.auth.token.value);
    const [uuid] = useState<string>(v4() + '@ticket');
    const [ t ] = useTranslation('ticket');
    const { response: categoryResp, force: forceCategoryReq } = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [
            token,
            {
                id: {
                    $eq: categoryId
                }
            }
        ],
        refreshRate: 60,
    },
    uuid);

    if (categoryResp.loading) {
        return <FullPageLoading/>;
    }

    if (categoryResp.error) {
        return (<Error message={t('fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={forceCategoryReq}/>);
    }

    if (categoryResp.data?.categories?.length > 0) {
        const cat = categoryResp.data.categories[0];
        return <DatesFetcher
            uuid={uuid}
            entityType={cat.parent_type === 'date' ? 'id' : 'group_id'}
            entityId={cat.parent_type === 'date' ? cat.parent_id : cat.group_id}
            ticketId={ticketId}
            transactionHash={transactionHash}
            category={{
                id: cat.id,
                name: cat.display_name,
                price: cat.prices.filter(price => price.currency === 'T721Token')[0].value,
                purchasedDate: purchasedDate,
            }}
            
        />
    } else {
        return <Redirect to={'/'}/>;
    }
};
