import * as React from 'react';
import { withKnobs, text, number, boolean, array } from '@storybook/addon-knobs';
import TicketSingle from '../../src/components/ticket/single';

export default {
  title: 'Ticket|Single',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const gradientsValues = ['#22c1c3', '#68bf93', '#8cbe7b', '#bdbd59', '#fdbb2d'];
const addOns = ['2x Free beer', 'VIP ACCESS'];

export const showcase = () => (
  <TicketSingle
    color={text('Color', '#DB535B')}
    gradient={array('Gradient', gradientsValues)}
    description={text('Description', ' Sed ac mattis elit, aliquam lobortis puus dictumst. Suspendisse a ex et lorem mattis faucibus rhoncus at justo')}
    feesIncluded={boolean('Fees included ?', false)}
    selected={boolean('Selected ?', false)}
    price={text('Starting price', '55€')}
    soldBy={text('Sold by', 'Astropolis')}
    ticketsLeft={number('Tickets left', 10)}
  />
);

export const reseller = () => (
  <TicketSingle
    addOns={array('Add-ons', addOns)}
    color={text('Color', '#DB535B')}
    gradient={array('Gradient', gradientsValues)}
    feesIncluded={boolean('Fees included ?', false)}
    resale
    selected={boolean('Selected ?', false)}
    price={text('Starting price', '55€')}
    soldBy={text('Sold by', 'Astropolis')}
    ticketsLeft={number('Tickets left', 1)}
  />
);

export const list = () => (
  <div>
    <TicketSingle
      feesIncluded={true}
      selected={false}
      price="55€"
      soldBy="Astropolis"
      ticketsLeft={1}
    />
    <TicketSingle
       feesIncluded={false}
       selected={true}
       price="55€"
       soldBy="User 122"
       ticketsLeft={1}
       resale
    />
  </div>
);
