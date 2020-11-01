import React, { useState } from 'react';
import { FullPageLoading } from '@frontend/flib-react/lib/components';
import { CartState }            from '../../../redux/ducks/cart';
import { Elements }             from '@stripe/react-stripe-js';
import { ActionSetEntity }      from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';
import { StripeCheckoutWeb }    from './StripeCheckoutWeb';
import { StripeCheckoutNative } from './StripeCheckoutNative';
import { useCustomStripe }      from '@frontend/core/lib/utils/useCustomStripe';

export interface StripeCheckoutProps {
    remoteCart: ActionSetEntity;
    cart: CartState;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = (props: StripeCheckoutProps): JSX.Element => {

    const sdk = useCustomStripe();

    if (sdk === null) {
        return <FullPageLoading/>;
    }

    if (sdk.platform === 'web') {
        return <Elements stripe={sdk.stripe}>
            <StripeCheckoutWeb
                remoteCart={props.remoteCart}
                cart={props.cart}
                stripe={sdk}
            />
        </Elements>;
    }

    if (sdk.platform === 'native') {
        return <StripeCheckoutNative
            remoteCart={props.remoteCart}
            cart={props.cart}
            stripe={sdk}
        />
    }

};


