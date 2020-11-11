import React, { lazy }                    from 'react';
import Admin from './routes/Admin';

export interface RouteDatum {
    path: string;
    page: React.FC<any>;
    topBar?: React.ReactElement;
    protected?: boolean;
    entityType?: 'events' | 'dates' | 'categories';
    entityParam?: 'eventId' | 'dateId' | 'categoryId';
    flag?: string;
}

export const routes: RouteDatum[] = [
    {
        path: '/event/:eventId/date/:dateId/category/:categoryId',
        page: lazy(() => import('./routes/EditCategory')),
        protected: true,
        entityType: 'categories',
        entityParam: 'categoryId'
    },
    {
        path: '/event/:eventId/date/:dateId/category',
        page: lazy(() => import('./routes/CreateCategory')),
        protected: true,
        entityType: 'dates',
        entityParam: 'dateId'
    },
    {
        path: '/event/:eventId/categories',
        page: lazy(() => import('./routes/CategoriesDashboard')),
        protected: true,
        entityType: 'events',
        entityParam: 'eventId'
    },
    {
        path: '/event/:eventId/category/:categoryId',
        page: lazy(() => import('./routes/EditCategory')),
        protected: true,
        entityType: 'categories',
        entityParam: 'categoryId'
    },
    {
        path: '/event/:eventId/category',
        page: lazy(() => import('./routes/CreateCategory')),
        protected: true,
        entityType: 'events',
        entityParam: 'eventId'
    },
    {
        path: '/event/:eventId/date/:dateId/general-infos',
        page: lazy(() => import('./routes/EditDate')),
        protected: true,
        entityType: 'dates',
        entityParam: 'dateId'
    },
    {
        path: '/event/:eventId/date/:dateId/styles',
        page: lazy(() => import('./routes/EditDate')),
        protected: true,
        entityType: 'dates',
        entityParam: 'dateId'
    },
    {
        path: '/event/:eventId/date/:dateId/categories',
        page: lazy(() => import('./routes/CategoriesDateDashboard')),
        protected: true,
        entityType: 'dates',
        entityParam: 'dateId'
    },
    {
        path: '/event/:eventId/date/:dateId/dates-typology',
        page: lazy(() => import('./routes/EditDate')),
        protected: true,
        entityType: 'dates',
        entityParam: 'dateId'
    },
    {
        path: '/event/:eventId/date',
        page: lazy(() => import('./routes/CreateDate')),
        protected: true,
        entityType: 'events',
        entityParam: 'eventId'
    },
    {
        path: '/event/:eventId/edit',
        page: lazy(() => import('./routes/EditEvent')),
        protected: true,
        entityType: 'events',
        entityParam: 'eventId'
    },
    {
        path: '/event/:eventId',
        page: lazy(() => import('./routes/DatesDashboard')),
        protected: true,
        entityType: 'events',
        entityParam: 'eventId'
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
        path: '/stripe/transactions',
        page: lazy(() => import('./routes/StripeTransactions')),
        protected: true,
        flag: 'stripe_interface_setup'
    },
    {
        path: '/_/redirect/close',
        page: lazy(() => import('./routes/CloseRedirect')),
    },
    {
        path: '/',
        page: lazy(() => import('./routes/EventsDasboard')),
        protected: true,
    }
];
