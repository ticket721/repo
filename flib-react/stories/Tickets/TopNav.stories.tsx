import * as React from 'react';
import { withKnobs, text, boolean } from '@storybook/addon-knobs';
import TopNav from '../../src/components/ticket/top-nav';

const subnavLinks = [
  {
    label: 'Link 1',
    id: 1,
    to: '#todo'
  },
  {
    label: 'Link 2',
    id: 2,
    to: '#todo2'
  }
]

export default {
  title: 'Ticket|TopNav',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

export const showcase = () => (
  <TopNav
    label={text('Title', '1 of 2')}
    scrolled={boolean('Scrolled ?', false)}
    subNav={subnavLinks}
  />
);
