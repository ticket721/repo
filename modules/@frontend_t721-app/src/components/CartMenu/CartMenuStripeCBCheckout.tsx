import React                              from 'react';
import { useCustomStripe }                from '@frontend/core/lib/utils/useCustomStripe';
import { FullPageLoading }                from '@frontend/flib-react/lib/components';
import { Elements }                       from '@stripe/react-stripe-js';
import { CartMenuStripeCBCheckoutWeb }    from './CartMenuStripeCBCheckoutWeb';
import { CartMenuStripeCBCheckoutNative } from './CartMenuStripeCBCheckoutNative';

interface CartMenuStripeCBCheckoutProps {
    stripeAccount: string;
    back: () => void;
}

export const CartMenuStripeCBCheckout: React.FC<CartMenuStripeCBCheckoutProps> = (props: CartMenuStripeCBCheckoutProps): JSX.Element => {

    const sdk = useCustomStripe({
        stripe_account: props.stripeAccount,
    });

    if (sdk === null) {
        return <FullPageLoading/>;
    }

    if (sdk.platform === 'web') {
        return <Elements stripe={sdk.stripe}>
            <CartMenuStripeCBCheckoutWeb
                stripe={sdk}
                back={props.back}
            />
        </Elements>;
    }

    if (sdk.platform === 'native') {
        return <CartMenuStripeCBCheckoutNative
            stripe={sdk}
            back={props.back}
        />;
    }

    return null;

};
