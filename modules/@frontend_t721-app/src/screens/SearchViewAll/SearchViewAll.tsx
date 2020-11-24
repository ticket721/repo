import './locales';
import React, { useState }         from 'react';
import { LocationModifier }        from '../../components/LocationModifier';
import { SearchViewAllResultList } from './SearchViewAllResultList';
import styled from 'styled-components';

const SearchWrapper = styled.div`
    width: 100vw;
    @media screen and (min-width: 900px) {
      width: 900px;
    }
`;

const Search: React.FC = () => {

    const [locationFilter, setLocationFilter] = useState({
        active: false,
        customCity: null
    });

    return (
        <SearchWrapper>
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
        </SearchWrapper>
    );
};

export default Search;
