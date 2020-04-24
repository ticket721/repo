import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import SingleImage from '../../src/components/events/single-image';
import TopNav from '../../src/components/ticket/top-nav';
import TagsList from '../../src/components/cards/tags-list';

export default {
  title: 'Search|Explore Category',
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

const events = [
  {
    id: '1',
    title: 'Matt Houlonski Houlonski',
    text: 'Mon, Feb 16 8:30PM',
    src: 'assets/images/slide-1.jpg',
    price: 33
  },
  {
    id: '2',
    title: 'Matt Houlonski',
    text: 'Mon, Feb 16 8:30PM',
    src: 'assets/images/slide-2.jpg',
    price: 33
  },
  {
    id: '3',
    title: 'Matt Houlonski',
    text: 'Mon, Feb 16 8:30PM',
    src: 'assets/images/slide-1.jpg',
    price: 33
  }
]

export const showcase = () => (
  <div>
    <TopNav label="Concerts in San Jose, CA" />
    <div className="clear--nav">
      <TagsList tags={tags} removeBg carousel/>
      <div className="margin--lr">
        {events.map(event => {
           return <SingleImage
                    key={event.id}
                    src={event.src}
                    id={event.id}
                    price={event.price}
                    text={event.text}
                    title={event.title}
                  />
        })}
      </div>
    </div>
  </div>
);

