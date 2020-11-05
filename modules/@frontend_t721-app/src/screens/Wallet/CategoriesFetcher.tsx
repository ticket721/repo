import React                           from 'react';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { useSelector }                 from 'react-redux';
import { T721AppState }                from '../../redux';
import { useTranslation }              from 'react-i18next';
import { Error, FullPageLoading }      from '@frontend/flib-react/lib/components';
import { DatesFetcher }                from './DatesFetcher';
import { TicketEntity }                     from '@common/sdk/lib/@backend_nest/libs/common/src/tickets/entities/Ticket.entity';

interface CategoriesFetcherProps {
    uuid: string;
    tickets: TicketEntity[];
}

export const CategoriesFetcher: React.FC<CategoriesFetcherProps> = ({ uuid, tickets }: CategoriesFetcherProps) => {
    const token = useSelector((state: T721AppState) => state.auth.token.value);
    const [ t ] = useTranslation(['wallet', 'common']);
    const { response: categoriesResp, force } = useRequest<CategoriesSearchResponseDto>({
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

    if (categoriesResp.loading) {
        return <FullPageLoading/>;
    }

    if (categoriesResp.error || categoriesResp.data?.categories?.length === 0) {
        return (<Error message={t('fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={force}/>);
    }

    if (categoriesResp.data?.categories?.length > 0) {
        return <DatesFetcher
            uuid={uuid}
            tickets={tickets}
            categories={categoriesResp.data.categories}
        />
    }
};
