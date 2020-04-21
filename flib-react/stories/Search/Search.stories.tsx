import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { text, withKnobs } from '@storybook/addon-knobs';
import SearchInput from '../../src/components/inputs/search';
import LocationHeader from '../../src/components/location-header';

export default {
  title: 'Search|Index',
  decorators: [
    withKnobs
  ]
};

export const showcase = () => (
  <div>
    <LocationHeader location={text('Current location', 'Quebec City, QC')} title={text('Title', 'Browsing events in')} />
    <SearchInput
      name={text('Input name', 'example')}
      onChange={action('typing...')}
      placeholder={text('Placeholder', 'Events, artists, venues...')}
      value={text('Value', '')}
    />
  </div>
);

