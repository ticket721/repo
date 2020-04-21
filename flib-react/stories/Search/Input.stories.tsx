import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { text, withKnobs } from '@storybook/addon-knobs';
import SearchInput from '../../src/components/inputs/search';

export default {
  title: 'Search|Input',
  decorators: [
    withKnobs
  ]
};

export const Text = () => (
  <SearchInput
    name={text('Input name', 'example')}
    onChange={action('typing...')}
    placeholder={text('Placeholder', 'Events, artists, venues...')}
    value={text('Value', '')}
  />
);

