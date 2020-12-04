import React from 'react';
import { useParams } from 'react-router';
import { eventParam }             from '../../types';
import { EventsFetcher } from '../../../components/Fetchers/EventsFetcher';
import { DatesFetcher } from '../../../components/Fetchers/DatesFetcher';
import { CategoriesFetcher } from '../../../components/Fetchers/CategoriesFetcher';
import { CreateCategoryView } from './CreateCategoryView';

export const CreateCategory: React.FC = () => {
    const { eventId } = useParams<eventParam>();

    return <EventsFetcher eventId={eventId}>
        <DatesFetcher eventId={eventId}>
            <CategoriesFetcher>
                <CreateCategoryView/>
            </CategoriesFetcher>
        </DatesFetcher>
    </EventsFetcher>
};
