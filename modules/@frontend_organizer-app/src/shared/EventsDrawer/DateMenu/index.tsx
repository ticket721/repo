import React from 'react';
import './locales';
import { useRouteMatch } from 'react-router';
import { categoryParam, dateParam, eventParam } from '../../../screens/types';
import { EventsFetcher } from '../../../components/Fetchers/EventsFetcher';
import { DatesFetcher } from '../../../components/Fetchers/DatesFetcher';
import { CategoriesFetcher } from '../../../components/Fetchers/CategoriesFetcher';
import { DateMenuView } from './View';

export const DateMenu: React.FC = () => {
    const match = useRouteMatch<eventParam & dateParam & categoryParam>('/event/:eventId/date/:dateId');

    return <EventsFetcher eventId={match?.params.eventId}>
        <DatesFetcher dateId={match?.params.dateId}>
            <CategoriesFetcher dateId={match?.params.dateId}>
                <DateMenuView eventId={match?.params.eventId} dateId={match?.params.dateId}/>
            </CategoriesFetcher>
        </DatesFetcher>
    </EventsFetcher>
}
