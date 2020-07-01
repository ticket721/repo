import React       from 'react';
import { Login, Register }       from '@frontend/core/lib/components';

import Dashboard          from './screens/Dashboard';
import CreateEvent        from './screens/CreateEvent';
import Preview            from './screens/Event/Preview';
import UpdateGeneralInfos from './screens/Event/UpdateGeneralInfos';
import UpdateCategory     from './screens/Event/UpdateCategory';
import NewCategory        from './screens/Event/NewCategory';
import UpdateStyles       from './screens/Event/UpdateStyles';
import UpdateLocation     from './screens/Event/UpdateLocation';
import NewDate            from './screens/Event/NewDate';
import FetchDate          from './screens/Event/FetchDate';

export interface RouteDatum {
    path: string;
    page: React.FC<any>;
    topBar?: React.ReactElement;
    protected?: boolean;
}

export const routes: RouteDatum[] = [
    {
        path: '/:groupId/date/:dateId/category/:categoryId',
        page: UpdateCategory,
        protected: true,
    },
    {
        path: '/:groupId/date/:dateId/category',
        page: NewCategory,
        protected: true,
    },
    {
        path: '/:groupId/date/:dateId/general-infos',
        page: UpdateGeneralInfos,
        protected: true,
    },
    {
        path: '/:groupId/date/:dateId/styles',
        page: UpdateStyles,
        protected: true,
    },
    {
        path: '/:groupId/date/:dateId/location',
        page: UpdateLocation,
        protected: true,
    },
    {
        path: '/:groupId/date/:dateId',
        page: Preview,
        protected: true,
    },
    {
        path: '/:groupId/event/:eventId/date',
        page: NewDate,
        protected: true
    },
    {
        path: '/:groupId',
        page: FetchDate,
        protected: true
    },
    {
        path: '/login',
        page: Login,
    },
    {
        path: '/register',
        page: Register,
    },
    {
        path: '/create-event',
        page: CreateEvent,
        protected: true,
    },
    {
        path: '/',
        page: Dashboard,
        protected: true,
    }
];
