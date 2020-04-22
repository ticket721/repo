import * as React from 'react';
import { withKnobs, text, boolean } from '@storybook/addon-knobs';
import TagsListCard from '../../src/components/cards/tags-list';
import { State, Store } from '@sambego/storybook-state';

export default {
  title: 'Cards|Tags list',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};


const tags = [
  {
    id: 1,
    label: 'indie rock'
  },
  {
    id: 12,
    label: 'country'
  },
  {
    id: 11,
    label: 'rock'
  },
  {
    id: 41,
    label: 'rock'
  },
  {
    id: 141,
    label: 'concert'
  },
  {
    id: 91,
    label: 'rock'
  }
]
const toggleAll = () => {
  store.set({
    showAll: !store.get('showAll')
  })
}

const store = new Store({
  showAll: false
})

export const Carousel = () => (
  <TagsListCard
    label={text ('Label', 'Tags')}
    tags={tags}
    carousel={boolean('Carousel ?', true)}
  />
)


export const NoToggle = () => (
  <TagsListCard
    label={text ('Label', 'Tags')}
    tags={tags.slice(0, 3)}
    handleToggle={toggleAll}
    hideLabel={text('Hide label', 'hide')}
  />
);

export const Toggle = () => (
  <State store={store}>
    {state => [
      <TagsListCard
        label={text ('Label', 'Tags')}
        handleToggle={toggleAll}
        showAll={state.showAll}
        tags={tags}
        hideLabel={text('Hide label', 'hide')}
      />
    ]}
  </State>
);
