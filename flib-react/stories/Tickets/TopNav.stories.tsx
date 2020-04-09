import * as React from 'react';
import { withKnobs, text, boolean } from '@storybook/addon-knobs';
import TopNav from '../../src/components/ticket/top-nav';
import { Store, State } from '@sambego/storybook-state';

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


const handleClick = () => {
  store.set({
    toggleSubNav: !store.get('toggleSubNav')
  })
}

const store = new Store({
  toggleSubNav: false
})

export const showcase = () => (
  <State store={store}>
    {state => [
      <TopNav
        handleClick={handleClick}
        label={text('Title', '1 of 2')}
        scrolled={boolean('Scrolled ?', false)}
        subNav={subnavLinks}
        showSubNav={state.toggleSubNav}
      />
    ]}
  </State>
);
