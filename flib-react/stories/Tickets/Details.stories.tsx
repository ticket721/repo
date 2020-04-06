import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import TicketHeader from '../../src/components/ticket/header';

const defaultTicket = {
  name: 'Ticket #1',
  location: 'Philharmonie de Paris',
  address: '221 avenue Jean Jaurès, Paris',
  number: 12,
  ticketType: '2 Days pass',
  startDate: '2020/02/14',
  endDate: '2020/20/15',
  ticketId: '00251501AS-D04546SD',
  startTime: '2:00PM',
  endTime: '4:00PM',
  gradients: ['#EBBC16', '#DB535B'],
  mainColor: '#EBBC16',
  addOns: 2,
  image: '/assets/images/ticket-1.jpg'
}

export default {
  title: 'Ticket|Details',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  },
  component: TicketHeader
};

export const Header = () => (
  <TicketHeader ticket={defaultTicket} fullWidth/>
);
