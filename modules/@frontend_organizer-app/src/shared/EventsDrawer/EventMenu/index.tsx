import React from 'react';
import { useRouteMatch }            from 'react-router';
import { eventParam }                  from '../../../screens/types';
import { EventsFetcher } from '../../../components/Fetchers/EventsFetcher';
import { DatesFetcher } from '../../../components/Fetchers/DatesFetcher';
import { CategoriesFetcher } from '../../../components/Fetchers/CategoriesFetcher';
import { EventMenuView } from './View';

export const EventMenu: React.FC = () => {
    const match = useRouteMatch<eventParam>('/event/:eventId');

    return <EventsFetcher eventId={match?.params.eventId}>
        <DatesFetcher>
            <CategoriesFetcher>
                <EventMenuView eventId={match?.params.eventId}/>
            </CategoriesFetcher>
        </DatesFetcher>
    </EventsFetcher>;
};
