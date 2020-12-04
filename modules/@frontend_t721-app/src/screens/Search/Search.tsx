import './locales';
import React, { useState }  from 'react';
import { LocationModifier } from '../../components/LocationModifier';
import { SearchResultList } from './SearchResultList';
import styled               from 'styled-components';
import { useKeyboardState } from '@frontend/core/lib/utils/useKeyboardState';

interface SearchWrapperProps {
    keyboardHeight: number;
}

const SearchWrapper = styled.div<SearchWrapperProps>`
    width: 100vw;
    @media screen and (min-width: 900px) {
      width: 900px;
    }
    padding-bottom: ${(props) => props.keyboardHeight}px;
`;

const Search: React.FC = () => {

    const [locationFilter, setLocationFilter] = useState({
        active: false,
        customCity: null
    });
    const keyboard = useKeyboardState();

    return (
        <SearchWrapper keyboardHeight={keyboard.keyboardHeight}>
            {
                locationFilter.active

                    ?
                    <LocationModifier
                        disableFilter={() => setLocationFilter({...locationFilter, active: false})}
                    />

                    :
                    <SearchResultList
                        enableFilter={() => setLocationFilter({...locationFilter, active: true})}

                    />
            }
        </SearchWrapper>
    );
};

export default Search;
