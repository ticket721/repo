import Search         from './screens/Search';
import Tags           from './screens/Tags';
import Profile        from './screens/Profile';
import Home                   from './screens/Home';
import { TempoTopBar, Test1 } from './screens/Test1';
import Wallet                 from './screens/Wallet';
import React          from 'react';

export interface LinkDatum {
    icon: string;
    to: string;
    size: string;
}

export interface RouteDatum {
    path: string;
    page: React.FC<any>;
    topBar?: React.ReactElement;
    topBarHeight?: string;
}

export const routes: RouteDatum[] = [
    {
        path: '/home/test',
        page: Test1,
        topBar: TempoTopBar,
    },
    {
        path: '/home',
        page: Home,
    },
    {
        path: '/profile',
        page: Profile,
    },
    {
        path: '/search',
        page: Search,
    },
    {
        path: '/tags',
        page: Tags,
    },
    {
        path: '/',
        page: Wallet,
    },
];

export const links: LinkDatum[] = [
    {
        icon: 'home',
        to: '/home',
        size: '22px',
    },
    {
        icon: 'search',
        to: '/search',
        size: '22px',
    },
    {
        icon: 't721',
        to: '/',
        size: '20px',
    },
    {
        icon: 'tags',
        to: '/tags',
        size: '22px',
    },
    {
        icon: 'profile',
        to: '/profile',
        size: '22px',
    },
];
