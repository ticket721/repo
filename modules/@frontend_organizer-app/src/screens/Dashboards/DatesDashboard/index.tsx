import React from 'react';
import { useParams } from 'react-router';
import { eventParam } from '../../types';
import { EventsFetcher } from '../../../components/Fetchers/EventsFetcher';
import { DatesFetcher } from '../../../components/Fetchers/DatesFetcher';
import { CategoriesFetcher } from '../../../components/Fetchers/CategoriesFetcher';
import { DatesView } from './DatesView';

export const DatesDashboard: React.FC = () => {
    const { eventId } = useParams<eventParam>();

    return <EventsFetcher eventId={eventId}>
        <DatesFetcher>
            <CategoriesFetcher>
                <DatesView eventId={eventId}/>
            </CategoriesFetcher>
        </DatesFetcher>
    </EventsFetcher>;
};
