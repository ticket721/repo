import React                         from 'react';
import { MobileWarning }             from '../utils/MobileWarning';
import { EventPageWrapper }          from '../utils/EventPageWrapper';
import { Invitations }                 from '../components/Invitations';
import { useRouteMatch }             from 'react-router';
import { categoryParam, eventParam } from '../screens/types';
import { EventsFetcher }             from '../components/Fetchers/EventsFetcher';
import { DesktopNavbarMargin } from '../utils/DesktopNavbarMargin';

const EventInvitationsContent = () => {
    const match = useRouteMatch<eventParam & categoryParam>(['/event/:eventId/invitations']);

    return <EventsFetcher
        eventId={match.params?.eventId}
    >
        <Invitations/>
    </EventsFetcher>
}

export default MobileWarning(DesktopNavbarMargin(EventPageWrapper(EventInvitationsContent)));
