import React                           from 'react';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { useTranslation }              from 'react-i18next';
import { Error, FullPageLoading }      from '@frontend/flib-react/lib/components';
import { DatesFetcher }                from './DatesFetcher';
import { TicketEntity }                from '@common/sdk/lib/@backend_nest/libs/common/src/tickets/entities/Ticket.entity';
import { isRequestError }              from '@frontend/core/lib/utils/isRequestError';
import { useToken } from '@frontend/core/lib/hooks/useToken';

interface CategoriesFetcherProps {
    uuid: string;
    tickets: TicketEntity[];
}

export const CategoriesFetcher: React.FC<CategoriesFetcherProps> = ({ uuid, tickets }: CategoriesFetcherProps) => {
    const token = useToken();
    const [ t ] = useTranslation(['wallet', 'common']);
    const categoriesResp = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [
            token,
            {
                id: {
                    $in: tickets.map(ticket => ticket.category)
                }
            }
        ],
        refreshRate: 60,
    },
    uuid);

    if (categoriesResp.response.loading) {
        return <FullPageLoading/>;
    }

    if (isRequestError(categoriesResp) || categoriesResp.response.data?.categories?.length === 0) {
        return (<Error message={t('fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={categoriesResp.force}/>);
    }

    if (categoriesResp.response.data?.categories?.length > 0) {
        return <DatesFetcher
            uuid={uuid}
            tickets={tickets}
            categories={categoriesResp.response.data.categories}
        />
    }
};
