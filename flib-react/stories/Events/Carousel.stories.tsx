import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import EventCarousel from '../../src/components/events/carousel';

export default {
  title: 'Events|Carousel',
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
    name: 'Matt Houlonski Houlonski',
    date: 'Mon, Feb 16 8:30PM',
    url: 'assets/images/slide-1.jpg'
  },
  {
    id: 2,
    name: 'Matt Houlonski',
    date: 'Mon, Feb 16 8:30PM',
    url: 'assets/images/slide-2.jpg'
  },
  {
    id: 3,
    name: 'Matt Houlonski',
    date: 'Mon, Feb 16 8:30PM',
    url: 'assets/images/slide-1.jpg'
  }
]

export const showcase = () => (
  <EventCarousel
    title={text('Title', 'More events')}
    slides={slides}
  />
);
