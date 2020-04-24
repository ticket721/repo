import * as React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import UserHeader from '../../src/components/elements/user-header';

export default {
  title: 'Global | User Header',
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
  <UserHeader user={user} profileHeader/>
)
