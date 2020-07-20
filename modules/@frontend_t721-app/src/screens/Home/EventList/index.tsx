import React                               from 'react';
import { FullPageLoading, LocationHeader } from '@frontend/flib-react/lib/components';
import { useTranslation }                  from 'react-i18next';
import { useSelector }                     from 'react-redux';
import { HomeEventList }                   from './HomeEventList';
import { LocationState, T721AppState }     from '../../../redux';
import styled                              from 'styled-components';

export interface EventListProps {
    enableFilter: () => void;
}

export const EventList: React.FC<EventListProps> = (props: EventListProps): JSX.Element => {

    const [t] = useTranslation('home');
    const location = useSelector((state: T721AppState): LocationState => state.location);

    const selectedLocation = location.customLocation || location.location;
    let locationString = null;

    if (selectedLocation) {
        locationString = `${selectedLocation.city.name}, ${selectedLocation.city.country}`;
    }

    const providedLocation = location.customLocation || location.location;

    return <EventListWrapper>
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
    </EventListWrapper>;

};

const EventListWrapper = styled.div`
    margin-top: ${props => props.theme.biggerSpacing};
`;
