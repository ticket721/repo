import React       from 'react';
import Activities  from '@frontend/core/lib/components/Profile/Activities';
import Funds       from '@frontend/core/lib/components/Profile/Funds';
import ProfileRoot from '@frontend/core/lib/components/Profile/Root';

export interface RouteDatum {
    path: string;
    component: React.FC<any>;
}

export const drawerRoutes: RouteDatum[] = [
    {
        path: '/activities',
        component: Activities,
    },
    {
        path: '/funds',
        component: Funds,
    },
    {
        path: '/',
        component: ProfileRoot,
    },
];

