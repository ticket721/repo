import React                           from 'react';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { useSelector }    from 'react-redux';
import { T721AppState }                from '../../redux';
import { useTranslation }         from 'react-i18next';
import { Error, FullPageLoading } from '@frontend/flib-react/lib/components';
import { DatesFetcher }                 from './DatesFetcher';

interface CategoryFetcherProps {
    uuid: string;
    categoryId: string;
    ticketId: string;
}

export const CategoryFetcher: React.FC<CategoryFetcherProps> = ({ uuid, categoryId, ticketId }: CategoryFetcherProps) => {
    const token = useSelector((state: T721AppState) => state.auth.token.value);
    const [ t ] = useTranslation(['ticket', 'common']);
    const { response: categoryResp, force } = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [
            token,
            {
                id: {
                    $eq: categoryId
                }
            }
        ],
        refreshRate: 5,
    },
    uuid);

    if (categoryResp.error || categoryResp.data?.categories?.length === 0) {
        return (<Error message={t('fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={force}/>);
    }

    if (categoryResp.loading) {
        return <FullPageLoading/>;
    }

    if (categoryResp.data?.categories?.length > 0) {
        const cat = categoryResp.data.categories[0];
        return <DatesFetcher
            uuid={uuid}
            entityType={cat.parent_type === 'date' ? 'id' : 'group_id'}
            entityId={cat.parent_type === 'date' ? cat.parent_id : cat.group_id}
            ticketId={ticketId}
            categoryName={cat.display_name}
        />
    }
};
