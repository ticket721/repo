import React                         from 'react';
import { MobileWarning }             from '../utils/MobileWarning';
import { EventPageWrapper }          from '../utils/EventPageWrapper';
import { Attendees }                 from '../components/Attendees';
import { useRouteMatch }             from 'react-router';
import { categoryParam, eventParam } from '../screens/types';
import { EventsFetcher }             from '../components/Fetchers/EventsFetcher';

const EventAttendeesContent = () => {
    const match = useRouteMatch<eventParam & categoryParam>(['/event/:eventId/attendees']);

    return <EventsFetcher
        eventId={match.params?.eventId}
    >
        <Attendees/>
    </EventsFetcher>
}

export default MobileWarning(EventPageWrapper(EventAttendeesContent));
