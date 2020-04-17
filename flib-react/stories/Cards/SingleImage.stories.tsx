import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import SingleImage from '../../src/components/cards/single-image';

export default {
  title: 'Cards|Single image',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

export const showcase = () => (
  <SingleImage
    src={text('URL', 'assets/images/ticket-1.jpg')}
  />
);

