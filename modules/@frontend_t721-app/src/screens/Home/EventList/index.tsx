import React                               from 'react';
import { FullPageLoading, LocationHeader } from '@frontend/flib-react/lib/components';
import { useTranslation }                  from 'react-i18next';
import { useSelector }                 from 'react-redux';
import { AppState }                    from '@frontend/core/lib/redux';
import { LocationState, UserLocation } from '@frontend/core/lib/redux/ducks/location';
import { HomeEventList }               from './HomeEventList';

export interface EventListProps {
    customLocation: UserLocation;
    enableFilter: () => void;
}

export const EventList: React.FC<EventListProps> = (props: EventListProps): JSX.Element => {

    const [t] = useTranslation('home');
    const location = useSelector((state: AppState): LocationState => state.location);

    const selectedLocation = props.customLocation || location.location;
    let locationString = null;

    if (selectedLocation) {
        locationString = `${selectedLocation.city.name}, ${selectedLocation.city.country}`;
    }

    const providedLocation = props.customLocation || location.location;

    return <div>
        <LocationHeader
            location={location.requesting ? '...' : locationString}
            title={t('browsing_events_in')}
            onFilter={props.enableFilter}
        />
        {
            providedLocation

                ?
                <HomeEventList location={providedLocation} requesting={location.requesting}/>

                :
                <FullPageLoading
                    width={250}
                    height={250}
                />
        }
    </div>;

};
