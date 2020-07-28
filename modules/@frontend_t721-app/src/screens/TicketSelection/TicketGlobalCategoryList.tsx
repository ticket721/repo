import React, { useState }                    from 'react';
import styled                                 from 'styled-components';
import { useSelector }                        from 'react-redux';
import { T721AppState }                       from '../../redux';
import { v4 }                                 from 'uuid';
import { useRequest }                         from '@frontend/core/lib/hooks/useRequest';
import { Error, FullPageLoading, TicketType } from '@frontend/flib-react/lib/components';
import { CategoriesSearchResponseDto }        from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { CategoryEntity }                     from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { DateEntity }                         from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { formatShort }                        from '@frontend/core/lib/utils/date';
import { EventsSearchResponseDto }            from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { EventEntity }                        from '@common/sdk/lib/@backend_nest/libs/common/src/events/entities/Event.entity';
import { useTranslation }                     from 'react-i18next';
import { Price }                              from '@common/sdk/lib/@backend_nest/libs/common/src/currencies/Currencies.service';
import { DatesSearchResponseDto }             from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';

export interface TicketGlobalCategoryListProps {
    date: DateEntity;
    selection: number;
    section: string;
    setSelection: (value: {section: string; selection: number, category: CategoryEntity}) => void;
}

const DescriptionText = styled.h4`
    font-weight: 200;
`;

const DescriptionHighlightText = styled.span`
    display: block;
    color: ${props => props.color};
`;

const DescriptionHighlightGlowText = styled.span`
    display: block;
    color: ${props => props.color};
    text-shadow: 0 0 2px ${props => props.color};
`;

const genDateCategoryDescription = (
    date: DateEntity,
    event: EventEntity,
    allOtherDates: DateEntity[]
): JSX.Element => {
    const otherEvents = allOtherDates.map((d: DateEntity, idx: number): JSX.Element =>
        <DescriptionHighlightGlowText key={idx} color={d.metadata.signature_colors[0]}>
            {`+ ${formatShort(new Date(d.timestamps.event_begin))}`}
        </DescriptionHighlightGlowText>);
    // tslint:disable-next-line:max-line-length
    return <DescriptionText>
        {date.metadata.name}
        <DescriptionHighlightText color={date.metadata.signature_colors[0]}>
            {formatShort(new Date(date.timestamps.event_begin))}
        </DescriptionHighlightText>
        {otherEvents.length ? otherEvents : null}
    </DescriptionText>;
};

const getEuroPrice = (category: CategoryEntity): string => {
    const T721TokenPriceIndex = category.prices.findIndex((price: Price): boolean => price.currency === 'T721Token');

    if (T721TokenPriceIndex === -1) {
        return '0'
    }

    return (parseInt(category.prices[T721TokenPriceIndex].value, 10) / 100).toString();
};

export const TicketGlobalCategoryList: React.FC<TicketGlobalCategoryListProps> = (props: TicketGlobalCategoryListProps): JSX.Element => {

    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [uuid] = useState(v4());
    const [t] = useTranslation(['event_ticket_list', 'common']);

    const globalCategories = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [
            token,
            {
                group_id: {
                    $eq: props.date.group_id,
                },
                parent_type: {
                    $eq: 'event',
                },
            },
        ],
        refreshRate: 5,
    }, `HomeEvent@${uuid}`);

    const event = useRequest<EventsSearchResponseDto>({
        method: 'events.search',
        args: [
            token,
            {
                group_id: {
                    $eq: props.date.group_id,
                },
            }
        ],
        refreshRate: 100
    }, `HomeEvent${uuid}`);

    const dates = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                parent_type: {
                    $eq: 'event'
                },
                group_id: {
                    $eq: props.date.group_id
                }
            }
        ],
        refreshRate: 100
    }, `HomeEvent@${uuid}`);

    if (globalCategories.response.loading || event.response.loading || dates.response.loading) {
        return <FullPageLoading width={250} height={250}/>;
    }

    if (globalCategories.response.error) {
        return <Error message={t('error_cannot_fetch_global_categories')} retryLabel={t('common:retrying_in')} onRefresh={globalCategories.force}/>;
    }

    if (event.response.error || event.response.data.events.length === 0) {
        return <Error message={t('error_cannot_fetch_event')} retryLabel={t('common:retrying_in')} onRefresh={event.force}/>;
    }

    if (dates.response.error) {
        return <Error message={t('error_cannot_fetch_dates')} retryLabel={t('common:retrying_in')} onRefresh={dates.force}/>;
    }

    const eventEntity = event.response.data.events[0];
    const allOtherDates = dates.response.data.dates.filter((date: DateEntity) => date.id !== props.date.id);

    let categoriesList = [];

    if (!globalCategories.response.loading) {
        categoriesList = globalCategories.response.data.categories.map((category: CategoryEntity, idx: number): JSX.Element => (
            <TicketType
                key={idx}
                saleBegin={new Date(category.sale_begin)}
                saleEnd={new Date(category.sale_end)}
                onClick={() => props.setSelection({section: 'global', selection: idx, category})}
                description={genDateCategoryDescription(props.date, eventEntity, allOtherDates)}
                gradient={props.date.metadata.signature_colors}
                selected={props.section === 'global' && props.selection === idx}
                price={`${getEuroPrice(category)} €`}
                title={category.display_name}
                ticketsLeft={category.seats - category.reserved}
                soldOutLabel={t('sold_out')}
                ticketsLeftLabel={t('left')}
                availableInLabel={t('available_in')}
                saleEndsInLabel={t('sale_ends_in')}
            />
        ));
    }

    if (categoriesList.length === 0) {
        return null;
    }

    return <>
        <h4 style={{marginLeft: 24, opacity: 0.7, fontWeight: 200, marginBottom: 12}}>{t('global_category_description')}</h4>
        {categoriesList}
    </>;
};
