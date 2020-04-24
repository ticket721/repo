import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';

import WalletCreditCard from '../../src/components/wallet/credit-card';

export default {
  title: 'Wallet | Credit card',
  decorators: [ withKnobs ],
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

const purchase = {
  eventName: 'HellFest 2020',
  amount: 325.21
}

export const showcase = () => (
  <WalletCreditCard user={user} purchase={purchase} />
)
