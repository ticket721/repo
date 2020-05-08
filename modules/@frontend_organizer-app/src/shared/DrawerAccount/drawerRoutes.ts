import React           from 'react';
import Activities      from './Activities';
import DrawerMenu      from './DrawerMenu';
import FundsAndPayment from './FundsAndPayment';

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
        path: '/fundsandpaymentmethod',
        component: FundsAndPayment,
    },
    {
        path: '/',
        component: DrawerMenu,
    },
];

export const computeDrawerPath = (pathname: string, drawerSubPath: string = ''): string => {
    const drawerPathMatchArray = (pathname.match(/^((\/([a-z]|-)+)?\/drawer)/));

    if (!drawerPathMatchArray) {
        return '/';
    }

    return drawerPathMatchArray[0] + drawerSubPath;
};
