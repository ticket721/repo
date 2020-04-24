import * as React from 'react';
import { text, withKnobs } from '@storybook/addon-knobs';
import SearchInput from '../../src/components/search/input';
import { Store, State } from '@sambego/storybook-state';

export default {
  title: 'Search|Input',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

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

export const Text = () => (
  <State store={store}>
  {state => [
    <SearchInput
      clearInput={clearInput}
      name={text('Input name', 'example')}
      onChange={handleChange}
      cancel={clearInput}
      placeholder={text('Placeholder', 'Events, artists, venues...')}
      value={state.value}
      cancelLabel={text('Cancel label', 'Cancel')}
    />
  ]}
  </State>
);

