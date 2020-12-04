import React from 'react';
import { useParams } from 'react-router';
import { eventParam } from '../../types';
import { CategoriesView } from './CategoriesView';
import { DatesFetcher } from '../../../components/Fetchers/DatesFetcher';
import { CategoriesFetcher } from '../../../components/Fetchers/CategoriesFetcher';
import { EventsFetcher } from '../../../components/Fetchers/EventsFetcher';

export const CategoriesDashboard: React.FC = () => {
    const { eventId } = useParams<eventParam>();

    return <EventsFetcher eventId={eventId}>
        <DatesFetcher>
            <CategoriesFetcher>
                <CategoriesView/>
            </CategoriesFetcher>
        </DatesFetcher>
    </EventsFetcher>;
};
