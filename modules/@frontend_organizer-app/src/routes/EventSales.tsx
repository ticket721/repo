import React                         from 'react';
import { MobileWarning }             from '../utils/MobileWarning';
import { EventPageWrapper }          from '../utils/EventPageWrapper';
import { useRouteMatch }             from 'react-router';
import { categoryParam, eventParam } from '../screens/types';
import { EventsFetcher }             from '../components/Fetchers/EventsFetcher';
import { Sales }                     from '../components/Sales';

const EventAttendeesContent = () => {
    const match = useRouteMatch<eventParam & categoryParam>(['/event/:eventId/sales']);

    return <EventsFetcher
        eventId={match.params?.eventId}
    >
        <Sales/>
    </EventsFetcher>
}

export default MobileWarning(EventPageWrapper(EventAttendeesContent));
