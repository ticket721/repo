import * as React from 'react';
import { text, withKnobs } from '@storybook/addon-knobs';
import SearchCategory from '../../src/components/search/category';

export default {
  title: 'Search|Category',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const gradient = ['#EBBC16', '#DB535B']

export const showcase = () => (
  <SearchCategory
    src={text('Background image', 'assets/images/event-01.jpg')}
    id={9}
    title={text('Category name', 'Popular esports')}
    text={text('Description', '1200 events')}
    gradient={gradient}
  />
);

