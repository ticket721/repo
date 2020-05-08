import Home        from './screens/Home';
import React       from 'react';
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
}

export const routes: RouteDatum[] = [
    {
        path: '/createevent',
        page: CreateEvent,
    },
    {
        path: '/',
        page: Home,
    },
];
