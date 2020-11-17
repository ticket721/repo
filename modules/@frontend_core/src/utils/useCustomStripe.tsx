import { Plugins }             from '@capacitor/core';
import { getEnv }                                                from './getEnv';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadStripe }                                            from '@stripe/stripe-js';
import { StripeSDK, StripeSDKContext } from './StripeSDKContext';

const { Stripe } = Plugins;

export interface StripeSDKOptions {
    stripe_account: string;
}

export const useCustomStripe = (options?: StripeSDKOptions): StripeSDK => {

    const stripeSDKContext = useContext(StripeSDKContext);

    const setSDK = useCallback((_sdk: StripeSDK) => {
        stripeSDKContext.store(options?.stripe_account || 'core', _sdk)
    }, [options])
    const sdk = useMemo(() => stripeSDKContext.instances[options?.stripe_account || 'core'] || null, [stripeSDKContext, options])
    const [registered, setRegistered] = useState(sdk !== null);

    useEffect(() => {
        if (!sdk && !registered) {
            setRegistered(true);
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
        }
    }, [stripeSDKContext.instances, setSDK, sdk]);

    return sdk;
};
