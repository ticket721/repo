import './locales';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { LocationHeader, SingleImage }              from '@frontend/flib-react/lib/components';
import { useTranslation }                           from 'react-i18next';
import { useDispatch, useSelector }                 from 'react-redux';
import { AppState }                                 from '@frontend/core/lib/redux';
import { GetLocation, LocationState, UserLocation } from '@frontend/core/lib/redux/ducks/location';
import { useRequest }                               from '@frontend/core/lib/hooks/useRequest';
import { v4 }                                       from 'uuid';
import { DatesSearchResponseDto }                   from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { DateEntity }                               from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { formatShort }                              from '@frontend/core/lib/utils/date';
import { CategoryEntity }                           from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { CategoriesSearchResponseDto }              from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { Price }                                    from '@common/sdk/lib/@backend_nest/libs/common/src/currencies/Currencies.service';

const LocationGate: React.FC = (props: PropsWithChildren<any>) => {
    const location = useSelector((state: AppState): LocationState => state.location);
    const dispatch = useDispatch();

    useEffect(() => {
        if (location.location === null && location.requesting === false) {
            dispatch(GetLocation());
        }
    });

    return <>
        {props.children}
    </>;

};

interface HomeEventListProps {
    location: UserLocation;
    requesting: boolean;
}


const HomeEventList: React.FC<HomeEventListProps> = (props: HomeEventListProps): JSX.Element => {

    const [uuid] = useState(v4());
    const token = useSelector((state: AppState): string => state.auth.token?.value);

    const dates = useRequest<DatesSearchResponseDto>(
        {
            method: 'dates.search',
            args: [
                token,
                {
                    status: {
                        $eq: 'live',
                    },
                    $sort: [
                        {
                            $nested: true,
                            $field_name: 'timestamps.event_begin',
                            $order: 'asc',
                        },
                    ],

                },
            ],
            refreshRate: 100,
        },
        `HomeEventList@${uuid}`,
    );

    if (dates.response.loading) {
        return <p>loading</p>;
    }

    if (dates.response.error) {
        return <p>error</p>;
    }


    return <div style={{padding: '5%'}}>
        {
            dates.response.data.dates.map((date: DateEntity, idx: number) => <HomeEvent key={idx} idx={idx} date={date}/>
            )
        }
    </div>;
};

export interface HomeEventProps {
    date: DateEntity;
    idx: number;
}

const getT721TokenPrice = (prices: Price[]): number => {
    if (prices.findIndex((price: Price): boolean => price.currency === 'T721Token') !== -1) {
        return parseInt(prices[prices.findIndex((price: Price): boolean => price.currency === 'T721Token')].value, 10) / 100;
    } else if (prices.length === 0) {
        return 0;
    } else {
        return null;
    }
};

const getPriceRange = (categories: CategoryEntity[]): [number, number] => {

    if (categories.length === 0) {
        return [null, null]
    }

    const prices = categories
        .map((category: CategoryEntity): number => getT721TokenPrice(category.prices))
        .filter((price: number): boolean => price !== null);

    const sortedPrices = prices.filter((price: number, idx: number): boolean => prices.indexOf(price) === idx)
        .sort((lprice: number, rprice: number) => lprice - rprice);

    if (sortedPrices.length === 1) {
        return [sortedPrices[0], null]
    } else if (sortedPrices.length) {
        return [sortedPrices[0], sortedPrices[sortedPrices.length - 1]];
    } else {
        return [null, null];
    }

};

const HomeEvent: React.FC<HomeEventProps> = (props: HomeEventProps): JSX.Element => {

    const serverUrl = `${process.env.REACT_APP_T721_SERVER_PROTOCOL}://${process.env.REACT_APP_T721_SERVER_HOST}:${process.env.REACT_APP_T721_SERVER_PORT}/static`;
    const imageUrl = `${serverUrl}/${props.date.metadata.avatar}`;
    const eventBegin = formatShort(new Date(props.date.timestamps.event_begin));
    const eventEnd = formatShort(new Date(props.date.timestamps.event_end));
    const [uuid] = useState(v4());
    const token = useSelector((state: AppState): string => state.auth.token?.value);

    const dateString = `${eventBegin ? eventBegin : null}${eventEnd && eventBegin ? ' - ' : null}${eventEnd ? eventEnd : null}`;

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
                }
            }
        ],
        refreshRate: 100
    }, `HomeEvent@${uuid}`);

    const priceRange = getPriceRange([
        ...(categories.response.data?.categories || []),
        ...(globalCategories.response.data?.categories || [])
    ]);

    let priceString;

    if (priceRange[0] && priceRange[1]) {
        priceString = `${priceRange[0] || 'FREE'} - ${priceRange[1]}`
    } else if (priceRange[0]) {
        priceString = `${priceRange[0]}`
    }

    return <SingleImage
        id={props.idx}
        key={props.idx}
        src={imageUrl}
        text={props.date.location.location_label}
        title={props.date.metadata.name}
        mainColor={props.date.metadata.signature_colors[0]}
        price={priceString}
        dateLabel={dateString}
    />
}

const Home: React.FC = () => {

    const [t] = useTranslation('home');
    const location = useSelector((state: AppState): LocationState => state.location);

    let locationString = null;

    if (location.location) {
        locationString = `${location.location.city.name}, ${location.location.city.country}`;
    }

    return (
        <LocationGate>
            <LocationHeader
                location={locationString || '...'}
                title={t('browsing_events_in')}
                onFilter={console.log.bind(null, 'salut')}
            />
            <HomeEventList location={location.location} requesting={location.requesting}/>
        </LocationGate>
    );
};

export default Home;
