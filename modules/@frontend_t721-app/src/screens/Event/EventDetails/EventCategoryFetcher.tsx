import { DateEntity }                  from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import React, { useState }             from 'react';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { getPriceRange }               from '../../../utils/prices';
import { EventContainer }              from './EventContainer';
import { EventCta }                    from '@frontend/flib-react/lib/components';
import { v4 }                          from 'uuid';
import { useSelector }                 from 'react-redux';
import { T721AppState }                from '../../../redux';
import { useTranslation }              from 'react-i18next';

export interface EventCategoryFetcherProps {
    date: DateEntity;
}

export const EventCategoryFetcher: React.FC<EventCategoryFetcherProps> = (props:EventCategoryFetcherProps): JSX.Element => {

    const [uuid] = useState(v4());
    const {token} = useSelector((state: T721AppState) => ({token: state.auth.token?.value}));
    const [ctaHidden, setCtaVisibility] = useState(false);
    const [t] = useTranslation('event');

    const categories = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [token, {
            id: {
                $in: props.date.categories
            }
        }],
        refreshRate: 100
    }, `HomeEvent@${uuid}`);

    const globalCategories = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [
            token,
            {
                group_id: {
                    $eq: props.date.group_id
                },
                parent_type: {
                    $eq: 'event'
                },
            }
        ],
        refreshRate: 100
    }, `HomeEvent@${uuid}`);

    const priceRange = getPriceRange([
        ...(categories.response.data?.categories || []),
        ...(globalCategories.response.data?.categories || [])
    ]);

    const priceString = priceRange[0] === priceRange[1]
        ?
        t('get_ticket_pricing_solo', {price: priceRange[0]})

        :
        t('get_ticket_pricing_range', {minPrice: priceRange[0], maxPrice: priceRange[1]});

    return <>
        <EventContainer
            priceString={`${t('tickets_from')} ${priceString}`}
            date={props.date}
            setCtaVisibility={setCtaVisibility}
        />
        <EventCta
            ctaLabel={t('get_tickets')}
            title={t('tickets_from')}
            onClick={console.log}
            subtitle={priceString}
            gradients={props.date.metadata.signature_colors}
            show={!ctaHidden}
        />
    </>;
};
