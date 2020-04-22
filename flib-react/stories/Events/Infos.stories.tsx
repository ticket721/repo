import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import EventInfos from '../../src/components/events/infos';

export default {
  title: 'Events|Informations',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};
const eventDetails = {
  name: 'Ticket #1',
  location: 'Philharmonie de Paris',
  address: '221 avenue Jean Jaurès, Paris',
  startDate: '2020/02/14',
  endDate: '2020/20/15',
  startTime: '2:00PM',
  about: 'Duis posuere dui ut arcu dictum pellentesque. Nunc ex nulla, dictum sed risus eget, tempus pretium ex. Mauris ornare tempor blandit. Cras et mollis quam, sit amet porttitor odio. Duis posuere dui ut arcu dictum pellentesque. Nunc ex nulla, dictum sed risus eget, tempus pretium ex. Mauris ornare tempor blandit. Cras et mollis quam, sit amet porttitor odio.',
  refundPolicy: {
    title: '10 days before',
    description: 'Sed ac mattis elit, aliquam lobortis purus. Suspendisse a ex et mattis.',
    link: '#todo'
  },
  tags: [],
  resale: true,
  hostedBy: {
    name: 'Band',
    image: 'assets/images/band-1.jpg',
    spotifyUrl: 'https://spotify.com',
    numberEvents: 12,
    eventsLink: 'todo'
  },
  endTime: '4:00PM',
  gradients: ['#EBBC16', '#DB535B'],
  mainColor: '#EBBC16',
  image: 'assets/images/ticket-1.jpg',
  photos: ['assets/images/event-1.jpg', 'assets/images/event-2.jpg', 'assets/images/event-3.jpg']
}

export const showcase = () => (
  <EventInfos
    event={eventDetails}
  />
);
