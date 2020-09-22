import { Plugins } from '@capacitor/core';
import { getEnv } from './getEnv';
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const { Stripe } = Plugins;

export interface StripeSDK {
    platform: 'native' | 'web';
    stripe: any;
}

export const useCustomStripe = (): StripeSDK => {
    const [sdk, setSDK] = useState(null);

    useEffect(() => {
        Stripe.setPublishableKey({
            key: getEnv().REACT_APP_STRIPE_API_KEY,
        })
            .then((e: Error) => {
                setSDK({
                    platform: 'native',
                    stripe: Stripe,
                });
            })
            .catch((e: Error) => {
                console.warn(e);
                loadStripe(getEnv().REACT_APP_STRIPE_API_KEY).then((stripe) => {
                    setSDK({
                        platform: 'web',
                        stripe,
                    });
                });
            });
    }, []);

    return sdk;
};
