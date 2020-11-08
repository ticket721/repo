import React, { useState }                       from 'react';
import { v4 }                                    from 'uuid';
import { useSelector }                           from 'react-redux';
import { DatesSearchResponseDto }                from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { Error, FullPageLoading, SearchResults } from '@frontend/flib-react/lib/components';
import { DateEntity }                            from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { useTranslation }                        from 'react-i18next';
import { SearchViewAllResultEvent }              from './SearchViewAllResultEvent';
import { UserLocation }                          from '../../../redux/ducks/location';
import { T721AppState }                          from '../../../redux';
import { useRequest }                            from '@frontend/core/lib/hooks/useRequest';
import { isRequestError }                        from '@frontend/core/lib/utils/isRequestError';

interface SearchEventListProps {
    location: UserLocation;
    requesting: boolean;
    query: string;
}

export const SearchViewAllEventList: React.FC<SearchEventListProps> = (props: SearchEventListProps): JSX.Element => {

    const [uuid] = useState(v4());
    const token = useSelector((state: T721AppState): string => state.auth.token?.value);
    const [t] = useTranslation('search_view_all');

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

    if (isRequestError(dates)) {
        return <Error message={dates.response.error}/>;
    }

    const formattedDates = dates.response.data.dates
        .map((date: DateEntity, idx: number) => (
            <SearchViewAllResultEvent date={date} key={idx} idx={idx}/>
        ));

    const searchResults = [];

    if (formattedDates.length) {
        searchResults.push({
            id: 0,
            name: t('showing_results_for', {query: props.query}),
            results: formattedDates,
        })
    }

    return <SearchResults
        searchResults={searchResults}
        noResultsLabel={t('no_results')}
    />;
};

