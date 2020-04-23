import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import slugify from 'slugify';
import styled from '../../src/config/styled';

import LocationHeader from '../../src/components/location-header';
import FeaturedCarousel from '../../src/components/events/featured-carousel';
import CategoriesCarousel from '../../src/components/events/categories-carousel';
import SingleImage from '../../src/components/events/single-image';

export default {
  title: 'Home | Preview',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const featuredSlides = [
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
];

const categoriesSlides = [
  {
    id: 1,
    name: 'Concert',
    url: '#todo',
    icon: 'assets/images/concert.png'
  },
  {
    id: 12,
    name: 'Esports',
    url: '#todo',
    icon: 'assets/images/esports.png',
  },
  {
    id: 16,
    name: 'Sports',
    url: '#todo',
    icon: 'assets/images/sports.png'
  },
  {
    id: 121,
    name: 'Sports',
    url: '#todo',
    icon: 'assets/images/sports.png'
  }
]

const popularEvents = [
  {
    title: 'Fortnite',
    text: '45 events',
    src: 'assets/images/slide-1.jpg'
  },
  {
    title: 'Rocket league',
    text: '21 events',
    src: 'assets/images/slide-2.jpg'
  },
  {
    title: 'CSGO',
    text: '143 events',
    src: 'assets/images/slide-1.jpg'
  }
]

const PopularEvent = styled(SingleImage)`
  margin-bottom: 16px;

  &:last-of-type {
    margin: 0;
  }
`

const Container = styled.div`
  padding: 24px;

  h2 {
    margin-bottom: 16px;
  }
`

export const showcase = () => (
  <div>
    <LocationHeader location={text('Current location', 'San Jose, CA')} title={text('Title', 'Browsing events in')} />
    <FeaturedCarousel
      slides={featuredSlides}
    />
    <CategoriesCarousel
      title="Browse by categories"
      slides={categoriesSlides}
    />
    <Container>
      <h2>Popular esports games</h2>
      {popularEvents.map((popular: any) => {
        return <PopularEvent
                key={slugify(popular.title, {lower: true})}
                src={popular.src}
                title={popular.title}
                text={popular.text}
                smaller
              />
      })}
    </Container>
  </div>
);
