import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs, text } from '@storybook/addon-knobs';
import WalletNav from '../../src/components/wallet/nav';

export default {
  title: 'Wallet | Navigation',
  decorators: [ withKnobs ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

export const showcase = () => (
  <WalletNav ctaLabel="Continue" onClick={action('...next step')} title={text('Title', 'Total')} subtitle={text('Amount', '€450')} show />
)
