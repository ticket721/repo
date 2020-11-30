import { StripeSDK }                                                from '@frontend/core/lib/utils/StripeSDKContext';
import { CartState }                                                from '../Cart/CartContext';
import React, { useEffect, useState }                               from 'react';
import { PaymentRequest, PaymentRequestPaymentMethodEvent, Stripe } from '@stripe/stripe-js';
import { PushNotification }                                         from '@frontend/core/lib/redux/ducks/notifications';
import { getEnv }                                                   from '@frontend/core/lib/utils/getEnv';
import { useDispatch }                                              from 'react-redux';
import { PaymentButtonDiv, PaymentButtonIcon }                      from './PaymentButton';
import './locales';
import { useTranslation }                                           from 'react-i18next';

interface ApplePayStatus {
    available: boolean;
    Button: JSX.Element;
}

export const useApplePay = (sdk: StripeSDK, cart: CartState): ApplePayStatus => {
    const [t] = useTranslation('cart');
    const [available, setAvailable] = useState(false);
    const [button, setButton] = useState<JSX.Element>(undefined);
    const [paymentRequest, setPaymentRequest] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {

        if (sdk && sdk.platform === 'web' && cart && cart.cart && !paymentRequest) {

            const pr: PaymentRequest = (sdk.stripe as Stripe).paymentRequest({
                requestPayerEmail: true,
                requestPayerName: true,
                country: 'FR',
                total: {
                    amount: cart.cart.price,
                    label: t('cart_name')
                },
                currency: cart.cart.currency.toLowerCase()
            });

            setPaymentRequest(pr);

            pr.canMakePayment().then(res => {

                if (res === null || !res.applePay) {
                    setAvailable(false);
                    return ;
                }

                setAvailable(true);

                pr.on('paymentmethod', async (ev: PaymentRequestPaymentMethodEvent) => {

                    const paymentInfos = JSON.parse(cart.cart.payment.client_id);

                    const { error } = await sdk.stripe.confirmCardPayment(paymentInfos.client_secret, {
                        payment_method: ev.paymentMethod.id
                    });

                    if (error) {
                        dispatch(PushNotification(error.message, 'error'));
                        ev.complete('fail');
                        return;
                    }

                    ev.complete('success');

                    cart.force(parseInt(getEnv().REACT_APP_ERROR_THRESHOLD, 10));
                });

                setButton(
                    <PaymentButtonDiv
                        whileTap={{
                            scale: 0.95
                        }}
                        disabled={false}
                        color={'#000000'}
                        textColor={'#ffffff'}
                        onClick={pr.show}
                    >
                        <span>{t('pay_with')}</span>
                        <PaymentButtonIcon
                            icon={'applepay'}
                            size={'18px'}
                            color={'#ffffff'}
                        />
                    </PaymentButtonDiv>
                );

            });

        }
        // eslint-disable-next-line
    }, [sdk, cart.cart, paymentRequest]);


    useEffect(() => {

        if (sdk && sdk.platform === 'native' && cart && cart.cart) {
            sdk.stripe.isApplePayAvailable().then((nativeAvailable) => {

                if (nativeAvailable.available) {
                    setAvailable(true);

                    const onClick = async () => {

                        const paymentInfos = JSON.parse(cart.cart.payment.client_id);

                        try {
                            const {error} = await sdk.stripe.confirmPaymentIntent({
                                stripeAccountId: paymentInfos.stripe_account,
                                clientSecret: paymentInfos.client_secret,
                                applePayOptions: {
                                    merchantId: getEnv().REACT_APP_APPLE_PAY_MERCHANT_ID,
                                    country: 'FR',
                                    currency: cart.cart.currency.toLowerCase(),
                                    billingEmailAddress: true,
                                    billingName: true,
                                    shippingEmailAddress: true,
                                    shippingName: true,
                                    items: [
                                        {
                                            amount: cart.cart.price / 100,
                                            label: t('cart_name')
                                        }
                                    ]
                                }
                            });

                            if (error) {
                                if (error.message === 'payment timeout or user cancelled') {
                                    dispatch(PushNotification(t('apple_pay_error'), 'error'));
                                } else {
                                    dispatch(PushNotification(error.message, 'error'));
                                }
                                return;
                            }

                        } catch (e) {
                            if (e.message === 'payment timeout or user cancelled') {
                                dispatch(PushNotification(t('apple_pay_error'), 'error'));
                            } else {
                                dispatch(PushNotification(e.message, 'error'));
                            }
                            return;
                        }

                        cart.force(parseInt(getEnv().REACT_APP_ERROR_THRESHOLD, 10));

                    }

                    setButton(
                        <PaymentButtonDiv
                            whileTap={{
                                scale: 0.95
                            }}
                            disabled={false}
                            color={'#000000'}
                            textColor={'#ffffff'}
                            onClick={onClick}
                        >
                            <span>{t('pay_with')}</span>
                            <PaymentButtonIcon
                                icon={'applepay'}
                                size={'18px'}
                                color={'#ffffff'}
                            />
                        </PaymentButtonDiv>
                    );
                }

            });
        }

        // eslint-disable-next-line
    }, [sdk, cart.cart])

    return {
        available,
        Button: button
    }

}
