import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import SponsorsCard from '../../src/components/ticket/cards/sponsors';

export default {
  title: 'Cards|Sponsors',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};


const sponsorsList = [
  {
    id: 1,
    name: 'XLive',
    logo: 'assets/images/logo--xlive.png'
  },
  {
    id: 2,
    name: 'iHeart',
    logo: 'assets/images/logo--iheart.png'
  },
  {
    id: 3,
    name: 'Corus',
    logo: 'assets/images/logo--corus.png'
  },
  {
    id: 4,
    name: 'SXSW',
    logo: 'assets/images/logo--sxsw.png'
  }
];

export const showcase = () => (
  <SponsorsCard
    title={text('Title','Sponsors')}
    sponsors={sponsorsList}
  />
)
