import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import PhotosVideosCard from '../../src/components/cards/photos-videos';

export default {
  title: 'Cards|Photos & Videos',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const photos = ['assets/images/event-1.jpg', 'assets/images/event-2.jpg', 'assets/images/event-3.jpg'];

export const grid = () => (
  <PhotosVideosCard
    title={text('Title','Photos and videos')}
    photos={photos}
  />
)
