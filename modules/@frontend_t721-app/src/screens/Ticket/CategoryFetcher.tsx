import React                           from 'react';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { useTranslation }              from 'react-i18next';
import { Error, FullPageLoading }      from '@frontend/flib-react/lib/components';
import { Redirect }                    from 'react-router';
import { DatesFetcher }                from './DatesFetcher';
import { TicketEntity }                from '@common/sdk/lib/@backend_nest/libs/common/src/tickets/entities/Ticket.entity';
import { isRequestError }              from '@frontend/core/lib/utils/isRequestError';
import { useToken } from '@frontend/core/lib/hooks/useToken';

interface CategoryFetcherProps {
    uuid: string;
    ticket: TicketEntity;
}

export const CategoryFetcher: React.FC<CategoryFetcherProps> = ({
    uuid,
    ticket
}: CategoryFetcherProps) => {
    const token = useToken();
    const [ t ] = useTranslation('ticket');
    const categoryResp = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [
            token,
            {
                id: {
                    $eq: ticket.category
                }
            }
        ],
        refreshRate: 60,
    },
    uuid);

    if (categoryResp.response.loading) {
        return <FullPageLoading/>;
    }

    if (isRequestError(categoryResp)) {
        return (<Error message={t('fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={categoryResp.force}/>);
    }

    const category = categoryResp.response.data.categories[0];

    if (category) {
        return <DatesFetcher
            uuid={uuid}
            ticket={ticket}
            category={category}
        />
    } else {
        return <Redirect to={'/'}/>;
    }
};
