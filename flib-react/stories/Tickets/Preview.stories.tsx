import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import styled from '../../config/styled';
import TicketHeader from '../../src/components/ticket/header';
import TicketPreview from '../../src/components/ticket/infos';

const defaultTicket = {
  name: 'Ticket #1',
  location: 'Philharmonie de Paris',
  address: '221 avenue Jean Jaurès, Paris',
  number: 12,
  ticketType: '2 Days pass',
  startDate: '2020/02/14',
  endDate: '2020/20/15',
  startTime: '2:00PM',
  endTime: '4:00PM',
  gradients: ['#EBBC16', '#DB535B'],
  mainColor: '#EBBC16',
  addOns: 2,
  image: '/assets/images/ticket-1.jpg'
}

export default {
  title: 'Ticket|Preview',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  },
  component: TicketHeader
};

const PullUp = styled.div`
  margin-top: -94px;
  position: relative;
  z-index: 1;
`

const Container = styled.div`
  border-radius: 8px;
  margin: 1rem;
  overflow: hidden;
`

export const Header = () => (
  <TicketHeader ticket={defaultTicket} />
);

export const Infos = () => (
  <TicketPreview ticket={defaultTicket} />
)

export const FullPreview = () => (
  <Container>
    <TicketHeader ticket={defaultTicket} />
    <PullUp>
      <TicketPreview ticket={defaultTicket} />
    </PullUp>
  </Container>
)
