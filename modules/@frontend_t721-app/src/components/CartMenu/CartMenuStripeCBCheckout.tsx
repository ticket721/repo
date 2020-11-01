import React, { useContext }           from 'react';
import { useCustomStripe }             from '@frontend/core/lib/utils/useCustomStripe';
import { FullPageLoading }             from '@frontend/flib-react/lib/components';
import { Elements }                    from '@stripe/react-stripe-js';
import { CartMenuStripeCBCheckoutWeb } from './CartMenuStripeCBCheckoutWeb';

interface CartMenuStripeCBCheckoutProps {
    stripeAccount: string;
}

export const CartMenuStripeCBCheckout: React.FC<CartMenuStripeCBCheckoutProps> = (props: CartMenuStripeCBCheckoutProps): JSX.Element => {

    const sdk = useCustomStripe({
        stripe_account: props.stripeAccount
    });

    if (sdk === null) {
        return <FullPageLoading/>;
    }

    if (sdk.platform === 'web') {
        return <Elements stripe={sdk.stripe}>
            <CartMenuStripeCBCheckoutWeb
                stripe={sdk}
            />
        </Elements>;
    }

    if (sdk.platform === 'native') {
        return <p>native</p>
    }

    return null;

}
