import * as React from 'react';
import {action } from '@storybook/addon-actions';
import { text, withKnobs, boolean } from '@storybook/addon-knobs';
import SearchInput from '../../src/components/search/input';
import LocationHeader from '../../src/components/location/header';
import SearchTerms from '../../src/components/search/terms';
import SearchCategory from '../../src/components/search/category';
import styled from '../../src/config/styled';

export default {
  title: 'Search|Explore',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const categories =[
  {
    id: 1,
    src: 'assets/images/event-01.jpg',
    text: '230 events',
    title: 'Music',
    icon: 'concert',
    mainColor: 'red',
    gradient: ['red', 'blue']
  },
  {
    id: 2,
    src: 'assets/images/event-01.jpg',
    text: '30 events',
    title: 'Sports',
    icon: 'sports',
    mainColor: 'green',
    gradient: ['green', 'pink']
  }
]

const searchTerms = [] = ['Rock', 'Metal', 'Country'];

const Category = styled(SearchCategory)`
  margin: 0 0 16px;

  &:last-of-type {
    margin: 0;
  }
`

export const showcase = () => (
  <div>
    <LocationHeader location={text('Current location', 'Quebec City, QC')} title={text('Title', 'Browsing events in')} />
    <SearchInput
      clearInput={action('clear')}
      name="input--search"
      onChange={action('typing...')}
      placeholder="Events, artists, venues..."
      cancelLabel="Cancel"
      cancel={action('cancel')}
    />
    <SearchTerms
      clearAll={action('Clear all')}
      clearLabel="Clear all"
      title="Recent search"
      noTerms="No recent search"
      terms={searchTerms}
    />
    <div className="container">
    {categories.map(category => {
      return <Category
                key={category.id}
                gradient={category.gradient}
                id={category.id}
                title={category.title}
                src={category.src}
                text={category.text}
                mainColor={category.mainColor}
                icon={category.icon}
             />
    })}
    </div>
  </div>
);

