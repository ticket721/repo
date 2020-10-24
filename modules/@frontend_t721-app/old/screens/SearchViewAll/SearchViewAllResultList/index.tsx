import React from 'react';
import { LocationHeader }     from '@frontend/flib-react/lib/components';
import { useTranslation }                  from 'react-i18next';
import { useSelector }        from 'react-redux';
import { T721AppState }                    from '../../../redux';
import { useRouteMatch }      from 'react-router';
import { SearchViewAllEventList }          from './SearchViewAllEventList';

export interface SearchResultListProps {
    enableFilter: () => void;
}

export const SearchViewAllResultList: React.FC<SearchResultListProps> = (props: SearchResultListProps): JSX.Element => {

    const [t] = useTranslation('search_view_all');
    const {location} = useSelector((state: T721AppState) => ({location: state.location}));
    const {query} = useRouteMatch().params as any;

    const selectedLocation = location.customLocation || location.location;
    let locationString = null;

    if (selectedLocation) {
        locationString = `${selectedLocation.city.name}, ${selectedLocation.city.country}`;
    }

    const providedLocation = location.customLocation || location.location;

    return <div>
        <LocationHeader
            location={location.requesting ? '...' : locationString}
            title={t('searching_events_in')}
            onFilter={props.enableFilter}
        />
        {
            query !== ''

                ?
                <SearchViewAllEventList
                    location={providedLocation}
                    requesting={location.requesting}
                    query={query}
                />

                :
                null
        }
    </div>;

};



