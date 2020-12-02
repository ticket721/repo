import React from 'react';
import { useParams } from 'react-router';
import { eventParam } from '../types';
import { EventsFetcher } from '../../components/Fetchers/EventsFetcher';
import { EditEventView } from './EditEventView';

export const EditEvent: React.FC = () => {
    const { eventId } = useParams<eventParam>();

    return <EventsFetcher eventId={eventId}>
        <EditEventView/>
    </EventsFetcher>;
}
