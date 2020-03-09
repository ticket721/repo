import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import TicketPreview from '../src/components/ticket/preview';

const defaultTicket = {
  name: 'Ticket #1',
  location: 'Philharmonie de Paris',
  address: '221 avenue Jean Jaurès, Paris',
  number: 12,
  ticketType: '2 Days pass',
  startDate: '2020/02/14',
  endDate: '2020/20/15',
  addOns: 2,
  image: '/assets/images/ticket-1.jpg'
}

export default {
  title: 'Ticket',
  decorators: [
    withKnobs
  ],
  component: TicketPreview
};

export const SingleTicket = () => (
  <TicketPreview ticket={defaultTicket} />
);
