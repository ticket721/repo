import * as React from 'react';
import { text, withKnobs } from '@storybook/addon-knobs';
import SearchTerms from '../../src/components/search/terms';
import { Store, State } from '@sambego/storybook-state';

export default {
  title: 'Search|Terms',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const clearAll = () => {
  store.set({
    terms: []
  })
};

const searchTerms = [] = ['Rock', 'Metal', 'Country'];

export const WithTerms = () => (
  <SearchTerms
    title={text('Title', 'Recent searches')}
    clearLabel={text('Clear', 'Clear all')}
    clearAll={clearAll}
    terms={searchTerms}
    noTerms={text('No results', 'No recent search')}
  />
);

const emptyArray = [] = [];

export const NoTerms = () => (
  <SearchTerms
    title={text('Title', 'Recent searches')}
    clearLabel={text('Clear', 'Clear all')}
    clearAll={clearAll}
    terms={emptyArray}
    noTerms={text('No results', 'No recent search')}
  />
);


const store = new Store({
  terms: ['R&B', 'Hip-hop']
})

export const ClearButton = () => (
  <State store={store}>
    {state => [
      <SearchTerms key="1"
        title={text('Title', 'Recent searches')}
        clearLabel={text('Clear', 'Clear all')}
        clearAll={clearAll}
        terms={state.terms}
        noTerms={text('No results', 'No recent search')}
      />
    ]}
  </State>
);
