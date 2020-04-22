import * as React from 'react';
import { withKnobs, text, number, boolean, array } from '@storybook/addon-knobs';
import TicketType from '../../src/components/ticket/type';

export default {
  title: 'Ticket|Type',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const gradientsValues = ['#22c1c3', '#68bf93', '#8cbe7b', '#bdbd59', '#fdbb2d'];

export const showcase = () => (
  <TicketType
    color={text('Color', '#DB535B')}
    gradient={array('Gradient', gradientsValues)}
    description={text('Description', ' Sed ac mattis elit, aliquam lobortis puus dictumst. Suspendisse a ex et lorem mattis faucibus rhoncus at justo')}
    feesIncluded={boolean('Fees included ?', false)}
    selected={boolean('Selected ?', false)}
    soldOutLabel={text('Sold out', 'Sold out')}
    startingPrice={text('Starting price', '55€')}
    startingPriceLabel={text('Starting at', 'Starting at')}
    title={text('Ticket type', '2 days VIP pass')}
    ticketsLeft={number('Tickets left', 10)}
    ticketsLeftLabel={text('Tickets left', 'left')}
  />
);

export const list = () => (
  <div>
    <TicketType
      description="Sed ac mattis elit, aliquam lobortis puus dictumst. Suspendisse a ex et lorem mattis faucibus rhoncus at justo"
      feesIncluded={true}
      selected={false}
      startingPrice="550€"
      title="2 days VIP pass"
      ticketsLeft={0}
      soldOutLabel="Sold out"
      startingPriceLabel="Starting at"
      ticketsLeftLabel="left"
    />
    <TicketType
       description="Sed ac mattis elit"
       feesIncluded={false}
       selected={true}
       startingPrice="55€"
       title="1 day ticket"
       ticketsLeft={130}
       soldOutLabel="Sold out"
       startingPriceLabel="Starting at"
       ticketsLeftLabel="left"
    />
  </div>
);
