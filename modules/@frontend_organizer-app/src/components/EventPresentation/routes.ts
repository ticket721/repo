import React       from 'react';

import GeneralInformation from './Pages/GeneralInformation';
import Dates from './Pages/Dates';
import Ticket from './Pages/Ticket';
import Presentation from './Pages/Presentation';
import Preview from './Pages/Preview';

export interface RouteDatum {
  path: string;
  component: React.FC<any>;
}

export const routes: RouteDatum[] = [
  {
    path: '/general',
    component: GeneralInformation,
  },
  {
    path: '/dates',
    component: Dates,
  },
  {
    path: '/ticket',
    component: Ticket,
  },
  {
    path: '/presentation',
    component: Presentation,
  },
  {
    path: '/',
    component: Preview,
  },
];

