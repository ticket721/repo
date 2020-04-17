import * as React from 'react';
import { withKnobs, text, number } from '@storybook/addon-knobs';
import PurchaseTotal from '../../src/components/ticket/total';
import { Store, State } from '@sambego/storybook-state';

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

const toggleFees = () => {
  store.set({
    showFees: !store.get('showFees')
  })
}

const store = new Store({
  showFees: false
})

export const showcase = () => (
  <State store={store}>
    {state => [
      <PurchaseTotal
        addOns={addOns}
        label={text('Title', 'Total')}
        tickets={ticket}
        fees={fees}
        taxes={number('Taxes', 20.00)}
        total={number('Total Amount', 115.56)}
        toggleFees={toggleFees}
        showFees={state.showFees}
        subtotal={number('SubTotal', 34.55)}
      />
    ]}
  </State>
);
