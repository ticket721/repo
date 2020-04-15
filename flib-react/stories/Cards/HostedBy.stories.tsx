import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import HostedByCard from '../../src/components/cards/hosted-by';

export default {
  title: 'Cards|Hosted by',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const hostedBy = {
  name: 'Tall Heights',
  image: 'assets/images/band-1.jpg',
  spotifyUrl: 'https://spotify.com',
  numberEvents: 12,
  eventsLink: 'todo'
}

export const showcase = () => (
  <HostedByCard
    title={text('Title:', 'Host by')}
    hostedBy={hostedBy}
  />

);
