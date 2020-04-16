
import * as React from 'react';
import { withKnobs, text, number, boolean, array } from '@storybook/addon-knobs';
import TicketQty from '../../src/components/ticket/ticket-qty';

export default {
  title: 'Ticket|Select quantity',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const gradientsValues = ['#22c1c3', '#68bf93', '#8cbe7b', '#bdbd59', '#fdbb2d'];

export const showcase = () => (
  <TicketQty
    color={text('Color', '#DB535B')}
    gradient={array('Gradient', gradientsValues)}
    description={text('Description', ' Sed ac mattis elit, aliquam lobortis puus dictumst. Suspendisse a ex et lorem mattis faucibus rhoncus at justo')}
    feesIncluded={boolean('Fees included ?', false)}
    selected={boolean('Selected ?', false)}
    price={text('Starting price', '55€')}
    title={text('Ticket type', '2 days VIP pass')}
    ticketsLeft={number('Tickets left', 10)}
  />
);

