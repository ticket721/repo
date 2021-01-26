import React                         from 'react';
import { MobileWarning }             from '../utils/MobileWarning';
import { EventPageWrapper }          from '../utils/EventPageWrapper';
import { useRouteMatch }             from 'react-router';
import { categoryParam, eventParam } from '../screens/types';
import { EventsFetcher }             from '../components/Fetchers/EventsFetcher';
import { DesktopNavbarMargin }       from '../utils/DesktopNavbarMargin';
import { Slip }                      from '../components/Slip';

const EventSlipContent = () => {
    const match = useRouteMatch<eventParam & categoryParam>(['/event/:eventId/slip']);

    return <EventsFetcher
        eventId={match.params?.eventId}
    >
        <Slip/>
    </EventsFetcher>
}

export default MobileWarning(DesktopNavbarMargin(EventPageWrapper(EventSlipContent)));
