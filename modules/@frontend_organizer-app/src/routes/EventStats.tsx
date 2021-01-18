import React from 'react';
import { MobileWarning }             from '../utils/MobileWarning';
import { EventPageWrapper }          from '../utils/EventPageWrapper';
import { Stats }                     from '../screens/Stats';
import { useRouteMatch }             from 'react-router';
import { categoryParam, eventParam } from '../screens/types';
import { DesktopNavbarMargin } from '../utils/DesktopNavbarMargin';

export default MobileWarning(DesktopNavbarMargin(EventPageWrapper(
    () => {
        const match = useRouteMatch<eventParam & categoryParam>(['/event/:eventId/stats']);
        return <Stats eventId={match.params.eventId}/>;
    }
)));
