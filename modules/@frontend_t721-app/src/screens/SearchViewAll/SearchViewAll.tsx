import './locales';
import React, { useState }         from 'react';
import { LocationGate }            from '../../components/LocationGate';
import { LocationModifier }        from '../../components/LocationModifier';
import { SearchViewAllResultList } from './SearchViewAllResultList';

const Search: React.FC = () => {

    const [locationFilter, setLocationFilter] = useState({
        active: false,
        customCity: null
    });

    return (
        <LocationGate>
            {
                locationFilter.active

                    ?
                    <LocationModifier
                        disableFilter={() => setLocationFilter({...locationFilter, active: false})}
                    />

                    :
                    <SearchViewAllResultList
                        enableFilter={() => setLocationFilter({...locationFilter, active: true})}

                    />
            }
        </LocationGate>
    );
};

export default Search;
