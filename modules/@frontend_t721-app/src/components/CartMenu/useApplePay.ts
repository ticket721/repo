import { StripeSDK }                                                from '@frontend/core/lib/utils/StripeSDKContext';
import { CartState }                                                from '../Cart/CartContext';
import { useEffect, useState }                                      from 'react';
import { PaymentRequest, PaymentRequestPaymentMethodEvent, Stripe } from '@stripe/stripe-js';
import { PushNotification }                                         from '@frontend/core/lib/redux/ducks/notifications';
import { getEnv }                                                   from '@frontend/core/lib/utils/getEnv';
import { useDispatch }                                              from 'react-redux';

interface ApplePayStatus {
    available: boolean;
    pay: () => void;
}

export const useApplePay = (sdk: StripeSDK, cart: CartState): ApplePayStatus => {
    const [available, setAvailable] = useState(false);
    const [pay, setPay] = useState(undefined);
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
                    label: 'Ticket721 Cart'
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

                setPay(pr.show);

            });

        }
        // eslint-disable-next-line
    }, [sdk, cart.cart, paymentRequest]);


    useEffect(() => {

        if (sdk && sdk.platform === 'native' && cart && cart.cart) {

        }

        // eslint-disable-next-line
    }, [sdk, cart.cart])

    return {
        available,
        pay
    }

}
