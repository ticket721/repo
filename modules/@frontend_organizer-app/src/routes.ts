import React       from 'react';
import { Login, Register }       from '@frontend/core/lib/components';

import Home        from './screens/Home';
import CreateEvent from './screens/CreateEvent';

export interface LinkDatum {
    icon: string;
    to: string;
    height?: string;
    width?: string;
}

export interface RouteDatum {
    path: string;
    page: React.FC<any>;
    topBar?: React.ReactElement;
    topBarHeight?: string;
    protected?: boolean;
}

export const routes: RouteDatum[] = [
    {
        path: '/create-event',
        page: CreateEvent,
        protected: true,
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
        path: '/',
        page: Home,
        // protected: true,
    },
];
