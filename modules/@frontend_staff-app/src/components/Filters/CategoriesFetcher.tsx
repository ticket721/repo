import React, { useState }             from 'react';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { useSelector }                 from 'react-redux';
import { StaffAppState }               from '../../redux';
import { v4 }                          from 'uuid';
import { Error, FullPageLoading }      from '@frontend/flib-react/lib/components';
import { useTranslation }              from 'react-i18next';
import './locales';
import { Filters }                     from './Filters';
import { formatCategories }            from './categoriesFormatter';
import { isRequestError }              from '@frontend/core/lib/utils/isRequestError';

interface CategoriesFetcherProps {
    open: boolean;
    onClose: () => void;
}

export const CategoriesFetcher: React.FC<CategoriesFetcherProps> = ({ open, onClose }: CategoriesFetcherProps) => {
    const [ t ] = useTranslation('fetch_errors');
    const [uuid] = useState(v4() + '@filters');
    const [
        token,
        eventId,
        dateId
    ] = useSelector((state: StaffAppState) => [
        state.auth.token.value,
        state.currentEvent.eventId,
        state.currentEvent.dateId,
    ]);

    const dateCategoriesReq = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [
            token,
            {
                parent_id: {
                    $eq: dateId
                }
            }
        ],
        refreshRate: 30,
    }, uuid);

    const globalCategoriesReq = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [
            token,
            {
                parent_id: {
                    $eq: eventId
                }
            }
        ],
        refreshRate: 30,
    }, uuid);

    if (dateCategoriesReq.response.loading || globalCategoriesReq.response.loading) {
        return <FullPageLoading/>;
    }

    if (isRequestError(dateCategoriesReq) || isRequestError(globalCategoriesReq)) {
        return <Error message={t('error_cannot_fetch_categories')} retryLabel={t('common:retrying_in')} onRefresh={() => {
            dateCategoriesReq.force();
            globalCategoriesReq.force();
        }}/>;
    }

    return <Filters
        dateCategories={formatCategories(dateCategoriesReq.response.data.categories)}
        globalCategories={formatCategories(globalCategoriesReq.response.data.categories)}
        open={open}
        onClose={onClose}
    />
};
