import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { text, withKnobs } from '@storybook/addon-knobs';

import FundsCard from '../../src/components/profile/funds-card';
import UserHeader from '../../src/components/elements/user-header';
import ActivitiesContainer from '../../src/components/profile/activities-container';
import LinksContainer from '../../src/components/profile/links-container';
import ArrowLink from '../../src/components/elements/arrow-link';
import TitleText from '../../src/components/ticket/cards/title-text';

export default {
  title: 'Profile | Preview',
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
    <UserHeader user={user} profileHeader />
    <ActivitiesContainer title="Recent activities" to="#todo" viewAllLabel="View all">
      <TitleText small text="hello" />
      <TitleText small text="hello hello" />
    </ActivitiesContainer>
    <FundsCard
      title={text('Title', 'My funds')}
      bankAccountLabel={text('Bank account label', 'Bank account')}
      currentBalanceLabel={text('Current balance label', 'Current balance')}
      onClick={action('..go to')}
      user={user}
      icon="euro"
    />
    <LinksContainer title="Account">
      <ArrowLink to="#todo" label="General information"/>
      <ArrowLink to="#todo" label="Payment information"/>
      <ArrowLink to="#todo" label="Main city" location="Paris, France" />
    </LinksContainer>
  </div>
)
