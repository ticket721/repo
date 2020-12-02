import React from 'react';
import { EventsFetcher } from '../../../components/Fetchers/EventsFetcher';
import { DashboardMenuView } from './View';

export const DashboardMenu: React.FC = () => {
    return <EventsFetcher>
        <DashboardMenuView/>
    </EventsFetcher>;
}
