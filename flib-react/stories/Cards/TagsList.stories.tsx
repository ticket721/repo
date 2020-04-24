import * as React from 'react';
import { withKnobs, text, boolean } from '@storybook/addon-knobs';
import TagsListCard from '../../src/components/cards/tags-list';

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
    hideLabel={text('Hide label', 'hide')}
  />
);

export const Toggle = () => (
  <TagsListCard
    label={text ('Label', 'Tags')}
    tags={tags}
    hideLabel={text('Hide label', 'hide')}
  />
);
