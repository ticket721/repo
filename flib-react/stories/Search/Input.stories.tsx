import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { text, withKnobs } from '@storybook/addon-knobs';
import SearchInput from '../../src/components/search/input';

export default {
  title: 'Search|Input',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

export const Text = () => (
  <SearchInput
    name={text('Input name', 'example')}
    onChange={action('typing...')}
    placeholder={text('Placeholder', 'Events, artists, venues...')}
    value={text('Value', '')}
  />
);

