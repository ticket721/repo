import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import SingleImage from '../src/components/events/single-image';

export default {
  title: 'Mobile | Home',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

// const gradientsValues = ['#22c1c3', '#68bf93', '#8cbe7b', '#bdbd59', '#fdbb2d'];

export const showcase = () => (
  <SingleImage
    title="Gallant"
    price={34}
    src="assets/images/event-01.jpg"
    text="Event type"
  />
);
