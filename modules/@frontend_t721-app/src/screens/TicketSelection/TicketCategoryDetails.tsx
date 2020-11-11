import React, { useState }                    from 'react';
import { Error, FullPageLoading, TicketType } from '@frontend/flib-react/lib/components';
import { CategoryEntity }                     from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { DateEntity }                         from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { useTranslation }                     from 'react-i18next';
import { useSelector }                        from 'react-redux';
import { T721AppState }                       from '../../redux';
import { v4 }                                 from 'uuid';
import { getPrice }                           from '../../utils/prices';
import { useRequest }                         from '@frontend/core/lib/hooks/useRequest';
import { isRequestError }                     from '@frontend/core/lib/utils/isRequestError';

export interface TicketCategoryDetailsProps {
    idx: number;
    category: CategoryEntity;
    date: DateEntity;
    onClick: () => void;
    selection: number;
}

export const TicketCategoryDetails: React.FC<TicketCategoryDetailsProps> = (props: TicketCategoryDetailsProps): JSX.Element => {

    const [t] = useTranslation(['event_ticket_list', 'common']);
    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [uuid] = useState(v4());

    const categoriesCount = useRequest<any>({
        method: 'categories.countTickets',
        args: [token, props.category.id],
        refreshRate: 5,
    }, `HomeEvent@${uuid}`);

    const relatedDates = useRequest<any>({
            method: 'dates.search',
            args: [token, {
                id: {
                    $in: props.category.dates
                },
                status: {
                    $eq: 'live'
                }
            }],
            refreshRate: 5,
        }, `HomeEvent@${uuid}`);

    if (categoriesCount.response.loading || relatedDates.response.loading) {
        return <FullPageLoading width={250} height={250}/>;
    }

    if (isRequestError(categoriesCount)) {
        return <Error message={t('error_cannot_fetch_categories')} retryLabel={t('common:retrying_in')} onRefresh={categoriesCount.force}/>;
    }

    if (isRequestError(relatedDates)) {
        return <Error message={t('error_cannot_fetch_dates')} retryLabel={t('common:retrying_in')} onRefresh={relatedDates.force}/>;
    }

    const dates = relatedDates.response.data.dates.filter((date: any): boolean => date.id !== props.date.id);
    const left = (props.category.seats - categoriesCount.response.data.count) < 0 ? 0 : props.category.seats - categoriesCount.response.data.count;

    return <TicketType
        saleBegin={new Date(props.category.sale_begin)}
        saleEnd={new Date(props.category.sale_end)}
        onClick={props.onClick}
        dates={[
            props.date,
            ...dates
        ].map((date: any) => ({
            name: date.metadata.name,
            start: new Date(date.timestamps.event_begin),
            online: date.online
        }))}
        gradient={props.date.metadata.signature_colors}
        selected={props.selection === props.idx}
        price={getPrice(props.category, t('free'))}
        title={props.category.display_name}
        ticketsLeft={left}
        soldOutLabel={t('sold_out')}
        ticketsLeftLabel={t('left')}
        availableInLabel={t('available_in')}
        saleEndsInLabel={t('sale_ends_in')}
    />;
}
