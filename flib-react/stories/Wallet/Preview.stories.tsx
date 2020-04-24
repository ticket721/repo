import * as React from 'react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import WalletHeader from '../../src/components/wallet/header';
import WalletOrder from '../../src/components/wallet/order';
import WalletContainer from '../../src/components/wallet/container';
import WalletNav from '../../src/components/wallet/nav';
import EventCta from '../../src/components/events/cta';
import { Store, State } from '@sambego/storybook-state';

export default {
  title: 'Wallet | Preview',
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


const showWallet = (show: boolean) => {
  store.set({
    showWallet: show
  })
}

const store = new Store({
  showWallet: false
})

export const showcase = () => (
  <State store={store}>
    {state => [
      <div>
        <WalletContainer title="Buying tickets" showWallet={state.showWallet} toggleWallet={showWallet} showPrev={boolean('Show previous', false)}>
          <WalletHeader user={user} />
          <WalletOrder user={user} purchase={purchase} />
          <WalletNav ctaLabel="Purchase Tickets" onClick={() => showWallet(true)} title="Total" subtitle={`€${purchase.amount}`} />
        </WalletContainer>
        <EventCta ctaLabel="Purchase Tickets" onClick={() => showWallet(true)} title="Total" subtitle={`€${purchase.amount}`} show />
      </div>
    ]}
  </State>
)
