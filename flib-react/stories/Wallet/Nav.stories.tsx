import * as React from 'react';
import { withKnobs, text, boolean } from '@storybook/addon-knobs';
import WalletNav from '../../src/components/wallet/nav';

export default {
  title: 'Wallet | Navigation',
  decorators: [ withKnobs ],
  parameters: {
    viewport: { defaultViewport: 'iphone6' },
  }
};

export const showcase = () => (
  <WalletNav title={text('Title', 'Buying tickets')} showPrev={boolean('Show back button ?', false)} />
)
