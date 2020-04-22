import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import LocationCard from '../../src/components/ticket/cards/location';

export default {
  title: 'Cards|Location',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

export const LocationOnly = () => (
  <LocationCard
    location={text('Location: ', 'Philharmonie de Paris')}
    address={text('Address:', '221 avenue Jean Jaurès, Paris')}
    iconColor={text('Color:', '#EBBC16')}
  />
);

export const WithLink = () => (
  <LocationCard
    location={text('Location: ', 'Philharmonie de Paris')}
    address={text('Address:', '221 avenue Jean Jaurès, Paris')}
    iconColor={text('Color:', '#EBBC16')}
    link='direction'
    linkLabel={text('Direction label', 'Get directions')}
  />
);
