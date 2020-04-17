import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
// import PurchaseTotal from '../../src/components/ticket/total';
import SingleImage from '../../src/components/cards/single-image';
import { Store, State } from '@sambego/storybook-state';

export default {
  title: 'Ticket|Order',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

// const ticket = {
//   quantity: 2,
//   price: 10.54
// }

// const addOns = [
//   {
//     id: 1,
//     name: 'Skip line',
//     quantity: 2,
//     price: 21.00
//   }
// ]


// const fees = [
//   {
//     id: 1,
//     name: 'Skip line fees',
//     price: 21.00
//   },
//   {
//     id: 3,
//     name: 'Admin fees',
//     price: 100.21
//   }
// ]

// const toggleFees = () => {
//   store.set({
//     showFees: !store.get('showFees')
//   })
// }

const store = new Store({
  showFees: false
})

export const showcase = () => (
  <State store={store}>
    {state => [
      <div>
        <h1>Review your order {state.showFees }</h1>
        <SingleImage src='assets/images/ticket-1.jpg' />
        <h2>Astropolis</h2>
      </div>
    ]}
  </State>
);
