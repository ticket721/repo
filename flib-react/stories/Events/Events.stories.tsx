import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import styled from '../../config/styled';
import EventHeader from '../../src/components/events/header';
import LocationCard from '../../src/components/cards/location';
import DateTimeCard from '../../src/components/cards/datetime';
import ReadMore from '../../src/components/cards/read-more';
import Border from '../../src/components/elements/border';
import PhotosVideosCard from '../../src/components/cards/photos-videos';
import { action } from '@storybook/addon-actions';
import Gradient from '../../src/components/elements/gradient';
import { Store, State } from '@sambego/storybook-state';

const eventDetails = {
  name: 'Ticket #1',
  location: 'Philharmonie de Paris',
  address: '221 avenue Jean Jaurès, Paris',
  startDate: '2020/02/14',
  endDate: '2020/20/15',
  startTime: '2:00PM',
  about: 'Duis posuere dui ut arcu dictum pellentesque. Nunc ex nulla, dictum sed risus eget, tempus pretium ex. Mauris ornare tempor blandit. Cras et mollis quam, sit amet porttitor odio. Duis posuere dui ut arcu dictum pellentesque. Nunc ex nulla, dictum sed risus eget, tempus pretium ex. Mauris ornare tempor blandit. Cras et mollis quam, sit amet porttitor odio.',
  refundPolicy: {
    title: '10 dats before',
    description: 'Sed ac mattis elit, aliquam lobortis purus. Suspendisse a ex et mattis.'
  },
  tags: ['music', 'concert', 'metal'],
  resale: true,
  hostedBy: {
    name: 'Band',
    image: 'assets/images/ticker-1.jpg'
  },
  endTime: '4:00PM',
  gradients: ['#EBBC16', '#DB535B'],
  mainColor: '#EBBC16',
  image: 'assets/images/ticket-1.jpg',
  photos: ['assets/images/event-1.jpg', 'assets/images/event-2.jpg', 'assets/images/event-3.jpg']
}

export default {
  title: 'Events|Details',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const Container = styled.div`
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  overflow: hidden;
`

const BgContainer = styled.div`
  background-color: #1B1726;
  margin-bottom: 32px;
`

const toggleText = () => {
  store.set({
    label: store.get('showText') ? 'Read more': 'Read less',
    showText: !store.get('showText')
  })
}

const store = new Store({
  label: 'Read more',
  showText: false
})

export const showcase = () => (
  <State store={store}>
    {state => [
    <div>
      <Container>
        <EventHeader
          event={eventDetails}
          onClick={action('clicked')}
        />
        <BgContainer>
          <DateTimeCard
            iconColor={eventDetails.mainColor}
            endDate={eventDetails.endDate}
            endTime={eventDetails.endTime}
            startDate={eventDetails.startDate}
            startTime={eventDetails.startTime}
            removeBg
          />
          <LocationCard
            address={eventDetails.address}
            iconColor={eventDetails.mainColor}
            location={eventDetails.location}
            removeBg
          />
          <Border />
          <ReadMore
            showText={state.showText}
            toggleText={toggleText}
            readMoreColor={eventDetails.mainColor}
            title="About"
            text={eventDetails.about}
            readMoreLabel={state.label}
            removeBg
          />
          <Border />
          <PhotosVideosCard title="Photos & videos" photos={eventDetails.photos} removeBg />
        </BgContainer>
        <Gradient values={eventDetails.gradients} blurOnly/>
      </Container>
      </div>
    ]}
  </State>
)
