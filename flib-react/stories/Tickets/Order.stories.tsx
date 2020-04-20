import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import { Store, State } from '@sambego/storybook-state';
import { action } from '@storybook/addon-actions'
import styled from '../../src/config/styled';

import SingleImage from '../../src/components/cards/single-image';
import TicketQty from '../../src/components/ticket/ticket-qty';
import AddOns from '../../src/components/cards/add-ons';
import DescriptonLink from '../../src/components/cards/description-link';
import Gradient from '../../src/components/elements/gradient';
import Border from '../../src/components/elements/border';
import PurchaseTotal from '../../src/components/ticket/total';
import TopNav from '../../src/components/ticket/top-nav';
import EventCta from '../../src/components/events/cta';
import EventInfos from '../../src/components/events/infos';

export default {
  title: 'Ticket|Order',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const event = {
  name: 'Ticket #1',
  location: 'Philharmonie de Paris',
  address: '221 avenue Jean Jaurès, Paris',
  startDate: '2020/02/14',
  endDate: '2020/20/15',
  startTime: '2:00PM',
  endTime: '4:00PM',
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
  gradients: ['#EBBC16', '#DB535B'],
  mainColor: '#EBBC16',
  image: 'assets/images/ticket-1.jpg',
  photos: ['assets/images/event-1.jpg', 'assets/images/event-2.jpg', 'assets/images/event-3.jpg']
}

const ticket = {
  quantity: 2,
  price: 10.54
}

const addOns = [
  {
    id: 'a12',
    name: '2 free beers',
    price: 15,
    description: 'Get 2 free beers for 15€',
    quantity: 3
  },
  {
    id: 'a12',
    name: 'VIP access',
    price: 150,
    description: 'Get VIP access',
    quantity: 3
  }
];

const fees = [
  {
    id: 1,
    name: 'Skip line fees',
    price: 21.00
  },
  {
    id: 3,
    name: 'Admin fees',
    price: 100.21
  }
]

const toggleFees = () => {
  store.set({
    showFees: !store.get('showFees')
  })
}

const store = new Store({
  showFees: false
})

const gradientsValues = ['#22c1c3', '#68bf93', '#8cbe7b', '#bdbd59', '#fdbb2d'];
const Container = styled.section`
  margin-bottom: 148px;
`

const Header = styled.header`
  margin: 64px 24px 0;
`

export const showcase = () => (
  <State store={store}>
    {state => [
      <div>
          <TopNav label="Tall heights tour 2020" />
          <Header>
            <h1>Review your order</h1>
            <SingleImage src='assets/images/ticket-1.jpg' />
          </Header>
        <Container>
          <Gradient values={gradientsValues} blurOnly/>

          <EventInfos
            event={event}
            pullUp
          />
          <Border />
          <TicketQty
            color="#DB535B"
            gradient={gradientsValues}
            description="Sed ac mattis elit, aliquam lobortis puus dictumst. Suspendisse a ex et lorem mattis faucibus rhoncus at justo"
            feesIncluded={false}
            selected={false}
            price="55€"
            ticketsLeft={10}
            title="Tickets"
            typeName="2 days VIP pass"
          />
          <Border />
          <AddOns
            onChange={action('change')}
            title="Add-ons"
            addOns={addOns}
            gradient={gradientsValues}
          />
          <Border />
          <DescriptonLink
            subtitle="Refund policy"
            title="Hello"
            text="ndisse a ex et lorem mattis faucibus rhoncus at just"
            link="#todo"
          />
          <Border />
          <PurchaseTotal
            addOns={addOns}
            label="Total"
            tickets={ticket}
            fees={fees}
            taxes={20.00}
            total={115.56}
            toggleFees={toggleFees}
            showFees={state.showFees}
            subtotal={34.55}
          />
        </Container>
        <EventCta
          ctaLabel="Purchase tickets"
          onClick={action('click')}
          show
          subtitle="150€"
          title="Total"
        />
      </div>
    ]}
  </State>
);
