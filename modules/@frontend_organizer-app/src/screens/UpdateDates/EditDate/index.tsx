import React from 'react';
import { useParams } from 'react-router';
import { dateParam, eventParam }                                                 from '../../types';
import { DatesFetcher } from '../../../components/Fetchers/DatesFetcher';
import { EditDateView } from './EditDateView';

export const EditDate: React.FC = () => {
    const { eventId, dateId } = useParams<eventParam & dateParam>();
    return <DatesFetcher eventId={eventId} dateId={dateId}>
        <EditDateView/>
    </DatesFetcher>;
}
