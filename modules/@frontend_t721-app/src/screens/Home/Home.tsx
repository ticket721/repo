import './locales';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { useDispatch, useSelector }                      from 'react-redux';
import { GetLocation, LocationState }                    from '@frontend/core/lib/redux/ducks/location';
import { EventList }                                     from './EventList';
import { LocationModifier }                              from '../../components/LocationModifier';
import { T721AppState }                                  from '../../redux';

const LocationGate: React.FC = (props: PropsWithChildren<any>) => {
    const location = useSelector((state: T721AppState): LocationState => state.location);
    const dispatch = useDispatch();

    useEffect(() => {
        if (location.location === null && location.requesting === false) {
            dispatch(GetLocation());
        }
    });

    return props.children;

};

const Home: React.FC = () => {

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
                    <EventList
                        enableFilter={() => setLocationFilter({...locationFilter, active: true})}

                    />
            }
        </LocationGate>
    );
};

export default Home;
