import * as React from 'react';
import {action } from '@storybook/addon-actions';
import { text, withKnobs } from '@storybook/addon-knobs';
import SearchInput from '../../src/components/search/input';
import LocationHeader from '../../src/components/location-header';
import SearchTerms from '../../src/components/search/terms';

export default {
  title: 'Search|Explore',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};


const searchTerms = [] = ['Rock', 'Metal', 'Country'];

export const showcase = () => (
  <div>
    <LocationHeader location={text('Current location', 'Quebec City, QC')} title={text('Title', 'Browsing events in')} />
    <SearchInput
      name="input--searcg"
      onChange={action('typing...')}
      placeholder="Events, artists, venues..."
    />
    <SearchTerms
      clearAll={action('Clear all')}
      clearLabel="Clear all"
      title="Recent search"
      noTerms="No recent search"
      terms={searchTerms}
    />
  </div>
);

