import { Plugins } from '@capacitor/core';
import { getEnv } from './getEnv';
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const { Stripe } = Plugins;

export interface StripeSDK {
    platform: 'native' | 'web';
    stripe: any;
}

export interface StripeSDKOptions {
    stripe_account: string;
}

export const useCustomStripe = (options?: StripeSDKOptions): StripeSDK => {
    const [sdk, setSDK] = useState(null);

    useEffect(() => {
        Stripe.setPublishableKey({
            key: getEnv().REACT_APP_STRIPE_API_KEY,
        })
            .then(async (e: Error) => {
                if (options.stripe_account) {
                    await Stripe.setStripeAccount({
                        stripe_account: options.stripe_account,
                    });
                }
                setSDK({
                    platform: 'native',
                    stripe: Stripe,
                });
            })
            .catch((e: Error) => {
                console.warn(e);
                loadStripe(getEnv().REACT_APP_STRIPE_API_KEY, {
                    stripeAccount: options?.stripe_account,
                }).then((stripe) => {
                    setSDK({
                        platform: 'web',
                        stripe,
                    });
                });
            });
    }, []);

    return sdk;
};
