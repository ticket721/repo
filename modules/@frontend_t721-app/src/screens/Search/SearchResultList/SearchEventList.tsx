import { UserLocation }                                       from '@frontend/core/lib/redux/ducks/location';
import React, { useState }                                    from 'react';
import { v4 }                                                 from 'uuid';
import { useSelector }                                        from 'react-redux';
import { AppState }                                           from '@frontend/core/lib/redux';
import { useRequest }                                         from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }                             from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { Error, FullPageLoading, SearchResults } from '@frontend/flib-react/lib/components';
import { DateEntity }                                         from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { useHistory }                                         from 'react-router';
import { useTranslation }                                     from 'react-i18next';
import { SearchResultEvent }                                  from './SearchResultEvent';


interface SearchEventListProps {
    location: UserLocation;
    requesting: boolean;
    query: string;
}

export const SearchEventList: React.FC<SearchEventListProps> = (props: SearchEventListProps): JSX.Element => {

    const [uuid] = useState(v4());
    const token = useSelector((state: AppState): string => state.auth.token?.value);
    const history = useHistory();
    const [t] = useTranslation('search');

    const dates = useRequest<DatesSearchResponseDto>(
        {
            method: 'dates.fuzzySearch',
            args: [
                token,
                {
                    lat: props.location.lat,
                    lon: props.location.lon,
                    query: props.query,
                },
            ],
            refreshRate: 100,
        },
        `SearchEventList@${uuid}`,
    );

    if (dates.response.loading || props.requesting) {
        return <FullPageLoading
            width={250}
            height={250}
        />;
    }

    if (dates.response.error) {
        return <Error message={dates.response.error}/>;
    }

    const formattedDates = dates.response.data.dates
        .slice(0, 3)
        .map((date: DateEntity, idx: number) => (
            <SearchResultEvent date={date} key={idx} idx={idx}/>
        ));

    const searchResults = [];

    if (formattedDates.length) {
        searchResults.push({
            id: 0,
            name: t('event_section_title'),
            url: `/search/events/${props.query}`,
            viewResultsLabel: dates.response.data.dates.length > 3 ? t('view_all_events', {count: dates.response.data.dates.length}) : undefined,
            onViewResults: () => history.push(`/search/events/${props.query}`),
            results: formattedDates,
        })
    }

    return <SearchResults
        searchResults={searchResults}
        noResultsLabel={t('no_results')}
    />;
};

