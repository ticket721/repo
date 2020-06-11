import Search                 from './screens/Search';
import Tags                   from './screens/Tags';
import Profile                from './screens/Profile';
import Home                   from './screens/Home';
import Wallet                 from './screens/Wallet';
import React                  from 'react';
import { Login, Register }    from '@frontend/core/lib/components';

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
    protected?: boolean;
}

export const routes: RouteDatum[] = [
    {
        path: '/login',
        page: Login,
        protected: false,
    },
    {
        path: '/register',
        page: Register,
        protected: false,
    },
    {
        path: '/home',
        page: Home,
        protected: false,
    },
    {
        path: '/profile',
        page: Profile,
        protected: true,
    },
    {
        path: '/search',
        page: Search,
        protected: false,
    },
    {
        path: '/tags',
        page: Tags,
        protected: false,
    },
    {
        path: '/',
        page: Wallet,
        protected: true,
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
