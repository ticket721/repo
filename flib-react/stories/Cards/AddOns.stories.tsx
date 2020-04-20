import * as React from 'react';
import { withKnobs, text, array } from '@storybook/addon-knobs';
import AddOns from '../../src/components/cards/add-ons';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Cards|Add-ons',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const addOns = [
  {
    id: 'a12',
    name: '2 free beers',
    price: 15,
    description: 'Get 2 free beers for 15€'
  },
  {
    id: 'a12',
    name: 'VIP access',
    price: 150,
    description: 'Get VIP access'
  }
];

const gradientsValues = ['#22c1c3', '#68bf93', '#8cbe7b', '#bdbd59', '#fdbb2d'];

export const showcase = () => (
  <AddOns
    onChange={action('change')}
    title={text('Title', 'Add-ons')}
    addOns={addOns}
    gradient={array('Colors', gradientsValues)}
  />
)
