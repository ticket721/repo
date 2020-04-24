import * as React from 'react';
import { withKnobs, text, number } from '@storybook/addon-knobs';
import PurchaseTotal from '../../src/components/ticket/total';

export default {
  title: 'Ticket|Purchase total',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const ticket = {
  quantity: 2,
  price: 10.54
}

const addOns = [
  {
    id: 1,
    name: 'Skip line',
    quantity: 2,
    price: 21.00
  }
]

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

export const showcase = () => (
  <PurchaseTotal
    addOns={addOns}
    label={text('Title', 'Total')}
    tickets={ticket}
    fees={fees}
    taxes={number('Taxes', 20.00)}
    total={number('Total Amount', 115.56)}
    subtotal={number('SubTotal', 34.55)}
  />
);
