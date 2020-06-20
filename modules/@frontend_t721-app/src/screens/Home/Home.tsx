import './locales';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { useDispatch, useSelector }                      from 'react-redux';
import { AppState }                                      from '@frontend/core/lib/redux';
import { GetLocation, LocationState }                    from '@frontend/core/lib/redux/ducks/location';
import { EventList }                                     from './EventList';
import { LocationModifier }                              from './LocationModifier';
import { City }                                          from '@common/global';

const LocationGate: React.FC = (props: PropsWithChildren<any>) => {
    const location = useSelector((state: AppState): LocationState => state.location);
    const dispatch = useDispatch();

    useEffect(() => {
        if (location.location === null && location.requesting === false) {
            console.log('dispatching get location');
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

    console.log(locationFilter.customCity);

    return (
        <LocationGate>
            {
                locationFilter.active

                    ?
                    <LocationModifier
                        disableFilter={() => setLocationFilter({...locationFilter, active: false})}
                        setCustomCity={(city: City): void => {
                            setLocationFilter({...locationFilter, active: false, customCity: city})
                        }}
                    />

                    :
                    <EventList
                        enableFilter={() => setLocationFilter({...locationFilter, active: true})}
                        customLocation={
                            locationFilter.customCity

                                ?
                                {
                                    city: locationFilter.customCity,
                                    lat: locationFilter.customCity.coord.lat,
                                    lon: locationFilter.customCity.coord.lon,
                                }

                                :
                                null
                        }

                    />
            }
        </LocationGate>
    );
};

export default Home;
