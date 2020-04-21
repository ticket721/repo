import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import FeaturedCarousel from '../../src/components/events/featured-carousel';

export default {
  title: 'Events|Featured Carousel',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const slides = [
  {
    title: 'Matt Houlonski Houlonski',
    text: 'Mon, Feb 16 8:30PM',
    src: 'assets/images/slide-1.jpg',
    price: 33,
    id: 2
  },
  {
    title: 'Matt Houlonski',
    text: 'Mon, Feb 16 8:30PM',
    src: 'assets/images/slide-2.jpg',
    price: 33,
    id: 21
  },
  {
    title: 'Matt',
    text: 'Mon, Feb 16 8:30PM',
    src: 'assets/images/slide-1.jpg',
    price: 33,
    id: 32
  }
]

export const showcase = () => (
  <FeaturedCarousel slides={slides} />
);
