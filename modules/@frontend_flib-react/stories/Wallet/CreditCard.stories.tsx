import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';

import WalletCreditCard from '../../src/components/wallet/credit-card';
import { action }       from '@storybook/addon-actions';

export default {
  title: 'Wallet | Credit card',
  decorators: [withKnobs],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  },
};

export const showcase = () => <WalletCreditCard
  onCCCCVChange={action('CCV')}
  onCCCodeChange={action('Credit Card')}
  onCCExpirationDateChange={action('Date')}
  onCCNameChange={action('Name')}
/>;
