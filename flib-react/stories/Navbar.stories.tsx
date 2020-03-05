import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import Navbar from '../src/components/navbar';

export default {
  title: 'Navbar',
  decorators: [
    withKnobs
  ],
  component: Navbar,
  parameters: {
    viewport: {
      defaultViewport: 'iphonex'
    }
  }
};


export const showcase = () => (
  <Navbar />
);
