import React from 'react';
import { useParams } from 'react-router';
import { eventParam, dateParam } from '../../types';
import { DatesFetcher } from '../../../components/Fetchers/DatesFetcher';
import { CategoriesFetcher } from '../../../components/Fetchers/CategoriesFetcher';
import { CategoriesDateView } from './CategoriesDateView';
import { EventsFetcher } from '../../../components/Fetchers/EventsFetcher';

export const CategoriesDateDashboard: React.FC = () => {
    const { eventId, dateId } = useParams<eventParam & dateParam>();

    return <EventsFetcher eventId={eventId}>
        <DatesFetcher eventId={eventId}>
            <CategoriesFetcher dateId={dateId}>
                <CategoriesDateView eventId={eventId} dateId={dateId}/>
            </CategoriesFetcher>
        </DatesFetcher>
    </EventsFetcher>;
};
