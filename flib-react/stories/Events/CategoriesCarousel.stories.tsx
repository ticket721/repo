import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import CategoriesCarousel from '../../src/components/events/categories-carousel';

export default {
  title: 'Events|Categories Carousel',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const slides = [
  {
    id: 1,
    name: 'Concert',
    url: '#todo',
    icon: 'assets/images/concert.png'
  },
  {
    id: 12,
    name: 'Esports',
    url: '#todo',
    icon: 'assets/images/esports.png',
  },
  {
    id: 21,
    name: 'Sports',
    url: '#todo',
    icon: 'assets/images/sports.png'
  },
  {
    id: 11,
    name: 'Sports',
    url: '#todo',
    icon: 'assets/images/sports.png'
  }
]

export const showcase = () => (
  <CategoriesCarousel
    title={text('Title', 'Browse by categories')}
    slides={slides}
  />
);
