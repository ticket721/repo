import React from 'react';
import { useParams } from 'react-router';
import { eventParam } from '../../types';
import { DatesFetcher } from '../../../components/Fetchers/DatesFetcher';
import { CreateDateView } from './CreateDateView';

export const CreateDate: React.FC = () => {
    const { eventId } = useParams<eventParam>();
    return <DatesFetcher eventId={eventId}>
        <CreateDateView/>
    </DatesFetcher>;
};
