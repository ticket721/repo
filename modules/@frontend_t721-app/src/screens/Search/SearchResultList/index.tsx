import React, { useState } from 'react';
import { LocationHeader, SearchInput }     from '@frontend/flib-react/lib/components';
import { useTranslation }                  from 'react-i18next';
import { useDispatch, useSelector }        from 'react-redux';
import { T721AppState }                    from '../../../redux';
import { SearchEventList }                 from './SearchEventList';
import { SetSearch }                       from '../../../redux/ducks/search';

export interface SearchResultListProps {
    enableFilter: () => void;
}

export const SearchResultList: React.FC<SearchResultListProps> = (props: SearchResultListProps): JSX.Element => {

    const [t] = useTranslation('search');
    const {location, query} = useSelector((state: T721AppState) => ({location: state.location, query: state.search.query}));
    const [search, setSearch] = useState(query);
    const dispatch = useDispatch();

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
        <SearchInput
            clearInput={() => {
                setSearch('');
                dispatch(SetSearch(''))
            }}
            name={'search'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearch(e.target.value);
                const currentInput = e.target.value;
                e.persist();
                setTimeout(() => {
                    if (currentInput === e.target.value) {
                        dispatch(SetSearch(e.target.value))
                    }
                }, 1000);
            }}
            placeholder={t('input_placeholder')}
            value={search}
            cancelLabel={t('cancel')}
            autofocus={true}
        />
        {
            query !== ''

                ?
                <SearchEventList
                    location={providedLocation}
                    requesting={location.requesting}
                    query={query}
                />

                :
                null
        }
    </div>;

};
