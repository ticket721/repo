import * as React from 'react';
import { withKnobs, text, color } from '@storybook/addon-knobs';
import SearchResults from '../../src/components/search/results';
import SearchInput from '../../src/components/search/input';
import { Store, State } from '@sambego/storybook-state';

export default {
  title: 'Search|Results',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const emptySearchResults = [] = [];

export const noResults = () => (
  <SearchResults
    searchResults={emptySearchResults}
    noResultsLabel={text('No results label', 'No results')}
    viewResultsLabel={text('View results label', 'View all results')}
  />
);

const searchResults = [
  {
    id: 43,
    name: 'Events',
    url: '#todo',
    results: [{
      id: 1,
      name: 'Event 1',
      price: 31,
      date: 'June 3rd 2020',
      image: 'assets/images/band-1.jpg'
    }]
  },
  {
    id: 2,
    name: 'Locations',
    url: '#todo',
    results: [{
      id: 1,
      name: 'James E. Memorial',
      url: '#todo',
      numberEvents: 31
    }]
  }
]

export const withResults = () => (
  <SearchResults
    mainColor={color('Color', '#079CF0')}
    searchResults={searchResults}
    noResultsLabel={text('No results label', 'No results')}
    viewResultsLabel={text('View results label', 'View all results')}
  />
);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const target = e.target as HTMLInputElement;

  store.set({
    value: target.value
  })
};

const clearInput = () => {
  store.set({
    value: ''
  })
}

const store = new Store({
  value: '',
});

export const withInput = () => (
  <State store={store}>
  {state => [
    <div key="1">
      <SearchInput
        clearInput={clearInput}
        name={text('Input name', 'example')}
        onChange={handleChange}
        cancel={clearInput}
        placeholder={text('Placeholder', 'Events, artists, venues...')}
        value={state.value}
        cancelLabel={text('Cancel label', 'Cancel')}
      />
      <SearchResults
        mainColor={color('Color', '#079CF0')}
        searchResults={searchResults}
        noResultsLabel={text('No results label', 'No results')}
        viewResultsLabel={text('View results label', 'View all results')}
      />
    </div>
  ]}
  </State>
)
