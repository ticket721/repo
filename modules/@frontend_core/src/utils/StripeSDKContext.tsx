import React, { PropsWithChildren, useCallback, useState } from 'react';

export interface StripeSDK {
    platform: 'native' | 'web';
    stripe: any;
}

export interface StripeSDKState {
    instances: {
        [key: string]: StripeSDK;
    }
    store: (account: string, sdk: StripeSDK) => void;
}

export const StripeSDKContext = React.createContext<StripeSDKState>({
    instances: {},
    store: () => null
});

export const StripeSDKManager: React.FC<PropsWithChildren<{}>> = (props: PropsWithChildren<{}>): JSX.Element => {

    const [stripeSdkState, setStripeSdkState] = useState<Omit<StripeSDKState, 'store'>>({
        instances: {},
    })

    const setInstance = useCallback((account: string, sdk: StripeSDK): void => {
        console.log(`Registered Stripe SDK for account ${account}`)
        setStripeSdkState({
            instances: {
                ...stripeSdkState.instances,
                [account]: sdk
            }
        })
    }, [stripeSdkState]);


    return <StripeSDKContext.Provider
        value={{
            instances: stripeSdkState.instances,
            store: setInstance
        }}
    >
        {props.children}
    </StripeSDKContext.Provider>
}
