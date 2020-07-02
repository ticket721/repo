import React       from 'react';
import { Login, Register, ValidateRoute }       from '@frontend/core/lib/components';

import Dashboard            from './screens/Dashboard';
import CreateEvent          from './screens/CreateEvent';
import Preview              from './screens/Event/Preview';
import UpdateGeneralInfos   from './screens/Event/UpdateGeneralInfos';
import UpdateCategory       from './screens/Event/UpdateCategory';
import NewCategory          from './screens/Event/NewCategory';
import UpdateStyles         from './screens/Event/UpdateStyles';
import UpdateLocation       from './screens/Event/UpdateLocation';
import NewDate              from './screens/Event/NewDate';
import UpdateGlobalCategory from './screens/Event/UpdateGlobalCategory';
import NewGlobalCategory    from './screens/Event/NewGlobalCategory';
import { MobileWarning }    from './utils/MobileWarning';
import FetchDate          from './screens/Event/FetchDate';

export interface RouteDatum {
    path: string;
    page: React.FC<any>;
    topBar?: React.ReactElement;
    protected?: boolean;
}

export const routes: RouteDatum[] = [
    {
        path: '/group/:groupId/event/:eventId/category/:categoryId',
        page: MobileWarning(UpdateGlobalCategory),
        protected: true,
    },
    {
        path: '/group/:groupId/event/:eventId/category',
        page: MobileWarning(NewGlobalCategory),
        protected: true,
    },
    {
        path: '/group/:groupId/date/:dateId/category/:categoryId',
        page: MobileWarning(UpdateCategory),
        protected: true,
    },
    {
        path: '/group/:groupId/date/:dateId/category',
        page: MobileWarning(NewCategory),
        protected: true,
    },
    {
        path: '/group/:groupId/date/:dateId/general-infos',
        page: MobileWarning(UpdateGeneralInfos),
        protected: true,
    },
    {
        path: '/group/:groupId/date/:dateId/styles',
        page: MobileWarning(UpdateStyles),
        protected: true,
    },
    {
        path: '/group/:groupId/date/:dateId/location',
        page: MobileWarning(UpdateLocation),
        protected: true,
    },
    {
        path: '/group/:groupId/date/:dateId',
        page: MobileWarning(Preview),
        protected: true,
    },
    {
        path: '/group/:groupId/event/:eventId/date',
        page: MobileWarning(NewDate),
        protected: true
    },
    {
        path: '/group/:groupId',
        page: MobileWarning(FetchDate),
        protected: true
    },
    {
        path: '/login',
        page: MobileWarning(Login),
    },
    {
        path: '/register',
        page: MobileWarning(Register),
    },
    {
        path: '/validate-email',
        page: ValidateRoute,
    },
    {
        path: '/create-event',
        page: MobileWarning(CreateEvent),
        protected: true,
    },
    {
        path: '/',
        page: MobileWarning(Dashboard),
        protected: true,
    }
];
