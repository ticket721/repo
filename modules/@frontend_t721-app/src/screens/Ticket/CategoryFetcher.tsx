import React                           from 'react';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { useSelector }                 from 'react-redux';
import { T721AppState }                from '../../redux';
import { useTranslation }              from 'react-i18next';
import { Error, FullPageLoading }      from '@frontend/flib-react/lib/components';
import { Redirect }                    from 'react-router';
import { DatesFetcher }                from './DatesFetcher';
import { TicketEntity }          from '@common/sdk/lib/@backend_nest/libs/common/src/tickets/entities/Ticket.entity';

interface CategoryFetcherProps {
    uuid: string;
    ticket: TicketEntity;
}

export const CategoryFetcher: React.FC<CategoryFetcherProps> = ({
    uuid,
    ticket
}: CategoryFetcherProps) => {
    const token = useSelector((state: T721AppState) => state.auth.token.value);
    const [ t ] = useTranslation('ticket');
    const { response: categoryResp, force: forceCategoryReq } = useRequest<CategoriesSearchResponseDto>({
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

    if (categoryResp.loading) {
        return <FullPageLoading/>;
    }

    if (categoryResp.error) {
        return (<Error message={t('fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={forceCategoryReq}/>);
    }

    const category = categoryResp.data.categories[0];

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
