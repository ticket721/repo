import React  from 'react';
import { useRequest }       from '@frontend/core/lib/hooks/useRequest';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { useDispatch, useSelector }    from 'react-redux';
import { T721AppState }                from '../../redux';
import { useDeepEffect }               from '@frontend/core/lib/hooks/useDeepEffect';
import { PushNotification }            from '@frontend/core/lib/redux/ducks/notifications';
import { useTranslation }              from 'react-i18next';
import { FullPageLoading }             from '@frontend/flib-react/lib/components';
import { Redirect }                    from 'react-router';
import { DatesFetcher }                 from './DatesFetcher';

interface CategoryFetcherProps {
    uuid: string;
    categoryId: string;
    ticketId: string;
    purchasedDate: Date;
}

export const CategoryFetcher: React.FC<CategoryFetcherProps> = ({ uuid, categoryId, ticketId, purchasedDate }: CategoryFetcherProps) => {
    const dispatch = useDispatch();
    const token = useSelector((state: T721AppState) => state.auth.token.value);
    const [ t ] = useTranslation('ticket');
    const { response: categoryResp } = useRequest<CategoriesSearchResponseDto>({
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

    useDeepEffect(() => {
        if (categoryResp.error) {
            dispatch(PushNotification(t('fetch_error'), 'error'));
        }
    }, [categoryResp.error]);

    if (categoryResp.loading) {
        return <FullPageLoading/>;
    }

    if (categoryResp.data?.categories?.length > 0) {
        const cat = categoryResp.data.categories[0];
        return <DatesFetcher
            uuid={uuid}
            entityType={cat.parent_type === 'date' ? 'id' : 'groupId'}
            entityId={cat.parent_type === 'date' ? cat.parent_id : cat.group_id}
            ticketId={ticketId}
            categoryName={cat.display_name}
            price={cat.prices.filter(price => price.currency === 'T721Token')[0].value}
            purchasedDate={purchasedDate}
        />
    } else {
        return <Redirect to={'/'}/>;
    }
};
