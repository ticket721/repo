import * as React from 'react';
import { withKnobs, text } from '@storybook/addon-knobs';
import PurchaseInfosCard from '../../src/components/ticket/cards/purchase-infos';

export default {
  title: 'Cards|Purchase Informations',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

export const showcase = () => (
  <PurchaseInfosCard
    date="2020/30/10"
    iconColor={text('Main color', '#D19F02')}
    price={text('Price', '$45')}
  />
);
