import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { text, withKnobs } from '@storybook/addon-knobs';
import FundsCard from '../../src/components/profile/funds-card';

export default {
  title: 'Profile|My Funds',
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
  <FundsCard
    bankAccountLabel={text('Title', 'Bank account')}
    currentBalanceLabel={text('Title', 'Current balance')}
    onClick={action('..go to')}
    user={user}
  />
)
