import React from 'react';
import { EventsFetcher } from '../../../components/Fetchers/EventsFetcher';
import { EventsView } from './EventsView';

export const EventsDashboard: React.FC = () => {
    return <EventsFetcher>
        <EventsView/>
    </EventsFetcher>;
};
