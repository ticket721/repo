import React, { lazy }                    from 'react';
import Admin from './routes/Admin';

export interface RouteDatum {
    path: string;
    page: React.FC<any>;
    topBar?: React.ReactElement;
    protected?: boolean;
    entityType?: string;
    paramId?: 'groupId' | 'dateId' | 'categoryId' | 'eventId';
    flag?: string;
}

export const routes: RouteDatum[] = [
    {
        path: '/group/:groupId/event/:eventId/category/:categoryId',
        page: lazy(() => import('./routes/UpdateGlobalCategory')),
        protected: true,
        entityType: 'event',
        paramId: 'groupId'
    },
    {
        path: '/group/:groupId/event/:eventId/category',
        page: lazy(() => import('./routes/NewGlobalCategory')),
        protected: true,
        entityType: 'event',
        paramId: 'groupId'
    },
    {
        path: '/group/:groupId/date/:dateId/category/:categoryId',
        page: lazy(() => import('./routes/UpdateCategory')),
        protected: true,
        entityType: 'event',
        paramId: 'groupId'
    },
    {
        path: '/group/:groupId/date/:dateId/category',
        page: lazy(() => import('./routes/NewCategory')),
        protected: true,
        entityType: 'event',
        paramId: 'groupId'
    },
    {
        path: '/group/:groupId/date/:dateId/general-infos',
        page: lazy(() => import('./routes/UpdateGeneralInfos')),
        protected: true,
        entityType: 'event',
        paramId: 'groupId'
    },
    {
        path: '/group/:groupId/date/:dateId/styles',
        page: lazy(() => import('./routes/UpdateStyles')),
        protected: true,
        entityType: 'event',
        paramId: 'groupId'
    },
    {
        path: '/group/:groupId/date/:dateId/location',
        page: lazy(() => import('./routes/UpdateLocation')),
        protected: true,
        entityType: 'event',
        paramId: 'groupId'
    },
    {
        path: '/group/:groupId/date/:dateId',
        page: lazy(() => import('./routes/Preview')),
        protected: true,
        entityType: 'event',
        paramId: 'groupId'
    },
    {
        path: '/group/:groupId/event/:eventId/date',
        page: lazy(() => import('./routes/NewDate')),
        protected: true,
        entityType: 'event',
        paramId: 'groupId'
    },
    {
        path: '/group/:groupId',
        page: lazy(() => import('./routes/FetchEvent')),
        protected: true,
        entityType: 'event',
        paramId: 'groupId'
    },
    {
        path: '/login',
        page: lazy(() => import('./routes/Login')),
    },
    {
        path: '/register',
        page: lazy(() => import('./routes/Register')),
    },
    {
        path: '/validate-email',
        page: lazy(() => import('./routes/ValidateRoute')),
    },
    {
        path: '/create-event',
        page: lazy(() => import('./routes/CreateEvent')),
        protected: true,
    },
    {
        path: '/you/are/an/admin',
        page: Admin,
        protected: true,
        flag: 'admin_flag'
    },
    {
        path: '/stripe/connect',
        page: lazy(() => import('./routes/StripeSetup')),
        protected: true,
        flag: 'stripe_interface_setup'
    },
    {
        path: '/stripe/create-bank-account',
        page: lazy(() => import('./routes/StripeCreateBankAccount')),
        protected: true,
        flag: 'stripe_interface_setup'
    },
    {
        path: '/stripe/withdraw',
        page: lazy(() => import('./routes/StripeWithdraw')),
        protected: true,
        flag: 'stripe_interface_setup'
    },
    {
        path: '/_/redirect/close',
        page: lazy(() => import('./routes/CloseRedirect')),
    },
    {
        path: '/',
        page: lazy(() => import('./routes/Dashboard')),
        protected: true,
    }
];
