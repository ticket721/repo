import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { text, withKnobs, array } from '@storybook/addon-knobs';
import LocationList from '../../src/components/location/list';

export default {
  title: 'Location|List',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const locations = ['Quebec City, CA', 'San Diego, USA', 'Paris, FR']

export const showcase = () => (
  <LocationList
    title={text('Title', 'Popular locations')}
    locations={array('Locations', locations)}
    updateLocation={action('...updating location')}
  />
)
