import React                              from 'react';
import { FullPageLoading }                from '@frontend/flib-react/lib/components';
import { Elements }                       from '@stripe/react-stripe-js';
import { CartMenuStripeCBCheckoutWeb }    from './CartMenuStripeCBCheckoutWeb';
import { CartMenuStripeCBCheckoutNative } from './CartMenuStripeCBCheckoutNative';
import { StripeSDK }                      from '@frontend/core/lib/contexts/StripeSDKContext';

interface CartMenuStripeCBCheckoutProps {
    stripeAccount: string;
    back: () => void;
    sdk: StripeSDK;
}

export const CartMenuStripeCBCheckout: React.FC<CartMenuStripeCBCheckoutProps> = (props: CartMenuStripeCBCheckoutProps): JSX.Element => {

    if (props.sdk === null) {
        return <FullPageLoading/>;
    }

    if (props.sdk.platform === 'web') {
        return <Elements stripe={props.sdk.stripe}>
            <CartMenuStripeCBCheckoutWeb
                stripe={props.sdk}
                back={props.back}
            />
        </Elements>;
    }

    if (props.sdk.platform === 'native') {
        return <CartMenuStripeCBCheckoutNative
            stripe={props.sdk}
            back={props.back}
        />;
    }

    return null;

};
