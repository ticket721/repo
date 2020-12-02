import React from 'react';
import { useParams } from 'react-router';
import { categoryParam, eventParam }             from '../../types';
import { EventsFetcher } from '../../../components/Fetchers/EventsFetcher';
import { CategoriesFetcher } from '../../../components/Fetchers/CategoriesFetcher';
import { DatesFetcher } from '../../../components/Fetchers/DatesFetcher';
import { EditCategoryView } from './EditCategoryView';

export const EditCategory: React.FC = () => {
    const { eventId, categoryId } = useParams<eventParam & categoryParam>();

    return <EventsFetcher eventId={eventId}>
        <DatesFetcher eventId={eventId}>
            <CategoriesFetcher categoryId={categoryId}>
                <EditCategoryView/>
            </CategoriesFetcher>
        </DatesFetcher>
    </EventsFetcher>
};
