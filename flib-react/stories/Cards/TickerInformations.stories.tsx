import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import TicketInfosCard from '../../src/components/ticket/cards/ticket-infos';

export default {
  title: 'Cards|Ticket Informations',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};
const seat = {
  block: 'A',
  row: 'A3',
  number: 53
}

export const showcase = () => (
  <TicketInfosCard
    eventName={text('Event name:', 'Concert #1')}
    ticketType={text('Ticket type:', '2 Days pass')}
    ticketID={text('Ticket ID', '00251501AS-D04546SD')}
    seatInfo={seat}
  />
);
