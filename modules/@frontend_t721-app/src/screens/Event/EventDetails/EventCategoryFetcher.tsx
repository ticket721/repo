import { DateEntity }                  from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import React, { useState }             from 'react';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { CategoriesSearchResponseDto }   from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { getLowestPrice, getPriceRange } from '../../../utils/prices';
import { EventContainer }                from './EventContainer';
import { EventCta }                    from '@frontend/flib-react/lib/components';
import { v4 }                          from 'uuid';
import { useSelector }                 from 'react-redux';
import { T721AppState }                from '../../../redux';
import { useTranslation }              from 'react-i18next';
import { useHistory }                  from 'react-router';
import { EventsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';

export interface EventCategoryFetcherProps {
    date: DateEntity;
}

export const EventCategoryFetcher: React.FC<EventCategoryFetcherProps> = (props:EventCategoryFetcherProps): JSX.Element => {

    const [uuid] = useState(v4());
    const {token} = useSelector((state: T721AppState) => ({token: state.auth.token?.value}));
    const [ctaHidden, setCtaVisibility] = useState(true);
    const [t] = useTranslation('event');
    const history = useHistory();

    const event = useRequest<EventsSearchResponseDto>({
        method: 'events.search',
        args: [token, {
            id: {
                $eq: props.date.event
            }
        }],
        refreshRate: 100
    }, `HomeEvent@${uuid}`);

    const categories = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [token, {
            id: {
                $in: props.date.categories
            },
            status: {
                $eq: 'live'
            }
        }],
        refreshRate: 100
    }, `HomeEvent@${uuid}`);

    const priceString = getLowestPrice([
        ...(categories.response.data?.categories || []),
    ], t('coming_soon'), t('free'));

    const priceRangeString = getPriceRange(
        [
            ...(categories.response.data?.categories || []),
        ],
        t('coming_soon'),
        t('free')
    );

    const goToTicketSelection = () => {
        history.push(`/event/${props.date.id}/selection`)
    };

    return <>
        <EventContainer
            eventName={event.response.data?.events[0].name}
            priceString={priceRangeString}
            date={props.date}
            setCtaVisibility={setCtaVisibility}
        />
        <EventCta
            ctaLabel={t('get_tickets')}
            title={t('tickets_from')}
            onClick={goToTicketSelection}
            subtitle={priceString}
            gradients={props.date.metadata.signature_colors}
            show={!ctaHidden}
        />
    </>;
};
