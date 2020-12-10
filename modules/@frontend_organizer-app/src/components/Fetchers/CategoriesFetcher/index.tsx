import React, { PropsWithChildren, useContext, useState } from 'react';
import { useRequest } from '@frontend/core/lib/hooks/useRequest';
import { v4 } from 'uuid';
import { useToken } from  '@frontend/core/lib/hooks/useToken';
import { FullPageLoading, Error } from '@frontend/flib-react/lib/components';
import { useTranslation } from 'react-i18next';
import './locales';
import { isRequestError } from '@frontend/core/lib/utils/isRequestError';
import { CategoryEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { EventsContext } from '../EventsFetcher';

export const CategoriesContext = React.createContext<{ categories: CategoryEntity[], forceFetch: () => void }>(undefined);

export interface CategoriesFetcherProps {
    dateId?: string;
    categoryId?: string;
}

export const CategoriesFetcher: React.FC<PropsWithChildren<CategoriesFetcherProps>> = ({ dateId, categoryId, children }) => {
    const { events } = useContext(EventsContext);
    const [ t ] = useTranslation(['categories_fetcher', 'utils']);
    const token = useToken();
    const [fetchCategoriesUuid] = useState<string>(v4() + '@categories-fetch');

    const categoriesReq = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [
            token,
            {
                group_id: {
                    $eq: events[0].group_id,
                },
                $sort: [{
                    $field_name: 'created_at',
                    $order: 'desc',
                }],
            },
        ],
        refreshRate: 60,
    }, fetchCategoriesUuid);

    if (categoriesReq.response.loading) {
        return <FullPageLoading/>;
    }

    if (isRequestError(categoriesReq)) {
        return <Error message={t('categories_fetch_error')} retryLabel={t('utils:retrying_in')} onRefresh={categoriesReq.force} />;
    }

    return <CategoriesContext.Provider value={{
        categories: categoryId ?
            categoriesReq.response.data.categories.filter(category => category.id === categoryId) :
            dateId ?
                categoriesReq.response.data.categories.filter(category => category.dates.includes(dateId)) :
                categoriesReq.response.data.categories,
        forceFetch: categoriesReq.force,
    }}>{children}</CategoriesContext.Provider>;
}
