import './locales';
import React, { useState } from 'react';
import { EventList }                  from './EventList';
import { LocationModifier } from '../../components/LocationModifier';

const Home: React.FC = () => {

    const [locationFilter, setLocationFilter] = useState({
        active: false,
        customCity: null,
    });

    return (
        <>
            {
                locationFilter.active

                    ?
                    <LocationModifier
                        disableFilter={() => setLocationFilter({ ...locationFilter, active: false })}
                    />

                    :
                    <EventList
                        enableFilter={() => setLocationFilter({ ...locationFilter, active: true })}
                    />
            }
        </>
    );
};

export default Home;
