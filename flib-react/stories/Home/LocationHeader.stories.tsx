import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import LocationHeader from '../../src/components/location-header';

export default {
  title: 'Home | Location header',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

export const showcase = () => (
  <LocationHeader
    title={text('Title', 'Browsing events in')}
    location={text('Location', 'San Diego, CA')}
  />
)
