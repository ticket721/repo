import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { withKnobs } from '@storybook/addon-knobs';

import UserHeader from '../../src/components/elements/user-header';
import WalletPaymentTypes from '../../src/components/wallet/payment-types';

export default {
    title: 'Wallet | Select payment type',
    decorators: [withKnobs],
    parameters: {
        viewport: { defaultViewport: 'iphone6' },
    },
};

const user = {
    firstName: 'Pete',
    lastName: 'Peter',
    profilePicture: 'assets/images/user-1.jpg',
    creditCard: 1736,
    creditBalance: 500,
    currentLocation: 'New York City, NY',
};

export const showcase = () => (
    <div>
        <UserHeader username={'mortimr'} picture={'assets/images/user-1.jpg'} tickets={'2'} />
        <WalletPaymentTypes user={user} onChange={action('payment type changed')} />
    </div>
);
