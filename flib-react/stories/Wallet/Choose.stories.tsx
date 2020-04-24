import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs } from '@storybook/addon-knobs';

import WalletHeader from '../../src/components/wallet/header';
import WalletPaymentTypes from '../../src/components/wallet/payment-types';

export default {
  title: 'Wallet | Select payment type',
  decorators: [
    withKnobs
  ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

const user = {
  firstName: 'Pete',
  lastName: 'Peter',
  profilePicture: 'assets/images/user-1.jpg',
  creditCard: 1736,
  creditBalance: 500,
  currentLocation: 'New York City, NY'
}

export const showcase = () => (
  <div>
    <WalletHeader user={user} />
    <WalletPaymentTypes
      user={user}
      onChange={action('payment type changed')}
    />
  </div>
)
