import React, { lazy }                    from 'react';
import Admin from './routes/Admin';
import CGUPage from './routes/CGU';
import CGOPage from './routes/CGO';
import PrivacyPage from './routes/Privacy';
import AcknowledgementsPage from './routes/Acknowledgements';

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
        path: '/about/cgu',
        page: CGUPage,
    },
    {
        path: '/about/cgo',
        page: CGOPage,
    },
    {
        path: '/about/privacy',
        page: PrivacyPage,
    },
    {
        path: '/about/acknowledgements',
        page: AcknowledgementsPage,
    },
    {
        path: '/_/google/redirect',
        page: lazy(() => import('./routes/GoogleRedirect'))
    },
    {
        path: '/event/:eventId/sales',
        page: lazy(() => import('./routes/EventSales')),
        protected: true
    },
    {
        path: '/event/:eventId/invitations',
        page: lazy(() => import('./routes/EventInvitations')),
        protected: true
    },
    {
        path: '/event/:eventId/slip',
        page: lazy(() => import('./routes/EventSlip')),
        protected: true
    },
    {
        path: '/event/:eventId/stats',
        page: lazy(() => import('./routes/EventStats')),
        protected: true
    },
    {
        path: '/event/:eventId/attendees',
        page: lazy(() => import('./routes/EventAttendees')),
        protected: true
    },
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
        path: '/reset',
        page: lazy(() => import('./routes/Reset')),
    },
    {
        path: '/reset-form',
        page: lazy(() => import('./routes/ResetForm')),
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
