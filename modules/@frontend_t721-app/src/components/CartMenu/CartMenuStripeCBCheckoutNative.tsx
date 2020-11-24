import { StripeSDK }                   from '@frontend/core/lib/utils/StripeSDKContext';
import React, { useContext, useState }        from 'react';
import styled, { useTheme }                   from 'styled-components';
import { useTranslation }                     from 'react-i18next';
import { useDispatch }                        from 'react-redux';
import { Theme }                              from '@frontend/flib-react/lib/config/theme';
import { TextInput, DoubleButtonCta, Button } from '@frontend/flib-react/lib/components';
import { PushNotification }                   from '@frontend/core/lib/redux/ducks/notifications';
import { CartContext }                        from '../Cart/CartContext';
import { useDeepEffect }                      from '@frontend/core/lib/hooks/useDeepEffect';
import { UserContext }                        from '@frontend/core/lib/utils/UserContext';
import { getEnv }                             from '@frontend/core/lib/utils/getEnv';
import MediaQuery                             from 'react-responsive';

const CreditCardWrapper = styled.div`
  padding: ${props => props.theme.regularSpacing};
`;

const Container = styled.div`
  overflow: scroll;
  @media screen and (max-width: 900px) {
      padding-bottom: 80px;
  }
`;

const Actions = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: ${props => props.theme.regularSpacing};
`;

const TextButton = styled.p`
    width: 30%;
    text-align: center;
    text-decoration: underline;
    color: ${(props) => props.theme.errorColor.hex};
    opacity: 0.8;
    cursor: pointer;
`;

const ButtonWrapper = styled.div`
    width: 60%;
`;

export interface CartMenuStripeCBCheckoutNativeProps {
    stripe: StripeSDK;
    back: () => void;
}

const isSubmittable = (...args: any[]): boolean => {
    return !!args.reduce((a: any, b: any) => !!a && !!b);
};

export const CartMenuStripeCBCheckoutNative: React.FC<CartMenuStripeCBCheckoutNativeProps> =
    (props: CartMenuStripeCBCheckoutNativeProps): JSX.Element => {
        const [fullName, setFullName] = useState(null);
        const [cardNumber, setCardNumber] = useState(null);
        const [cardNumberValid, setCardNumberValidity] = useState(true);
        const [cardCcv, setCardCcv] = useState(null);
        const [cardCcvValid, setCardCcvValidity] = useState(true);
        const [cardExpiry, setCardExpiry] = useState(null);
        const [cardExpiryValid, setCardExpiryValidity] = useState(true);
        const [focused, setFocused] = useState(null);
        const [submitted, setSubmitted] = useState(false);
        const [t] = useTranslation('cart');
        const stripe = props.stripe.stripe;
        const dispatch = useDispatch();
        const submittable = isSubmittable(fullName, cardNumber, cardCcv, cardExpiry, cardNumberValid, cardCcvValid, cardExpiryValid);
        const theme = useTheme() as Theme;
        const cart = useContext(CartContext);
        const user = useContext(UserContext);

        useDeepEffect(() => {

            if (cardNumber !== null) {

                const timeoutId = setTimeout(async () => {
                    const { valid } = await stripe.validateCardNumber({ number: cardNumber });
                    setCardNumberValidity(valid);
                }, 1000);
                return () => {
                    clearTimeout(timeoutId);
                };

            }

        }, [cardNumber, stripe]);

        useDeepEffect(() => {

            if (cardExpiry !== null && cardExpiry.length) {

                if (cardExpiry.length === 5) {
                    const timeoutId = setTimeout(async () => {
                        const { valid } = await stripe.validateExpiryDate({ exp_month: cardExpiry.slice(0, 2), exp_year: cardExpiry.slice(3) });
                        setCardExpiryValidity(valid);
                    }, 1000);
                    return () => {
                        clearTimeout(timeoutId);
                    };
                } else {
                    setCardExpiryValidity(false);
                }

            }

        }, [cardExpiry, stripe]);

        useDeepEffect(() => {

            if (cardCcv !== null && cardCcv.length) {

                if (cardCcv.length === 3) {

                    const timeoutId = setTimeout(async () => {
                        const { valid } = await stripe.validateCVC({ cvc: cardCcv });
                        setCardCcvValidity(valid);
                    }, 1000);
                    return () => {
                        clearTimeout(timeoutId);
                    };

                } else {
                    setCardCcvValidity(false);
                }

            }

        }, [cardCcv, stripe]);

        const handleSubmit = async () => {

            if (!submittable || !cart.cart?.payment) {
                return;
            }

            const paymentInfos = JSON.parse(cart.cart.payment.client_id);
            setSubmitted(true);

            try {
                const { error } = await stripe.confirmPaymentIntent({
                    stripeAccountId: paymentInfos.stripe_account,
                    clientSecret: paymentInfos.client_secret,
                    card: {
                        number: cardNumber.split(' ').join(''),
                        exp_month: cardExpiry.slice(0, 2),
                        exp_year: cardExpiry.slice(3),
                        cvc: cardCcv,
                        name: fullName,
                        email: user.email
                    },
                    name: fullName,
                    email: user.email
                });

                console.log(error, 'error');

                if (error) {
                    dispatch(PushNotification(error.message, 'error'));
                    setSubmitted(false);
                    return;
                }

            } catch (e) {
                dispatch(PushNotification(e.message, 'error'));
                setSubmitted(false);
                return;
            }

            cart.force(parseInt(getEnv().REACT_APP_ERROR_THRESHOLD, 10));

        };

        return <Container>
            <CreditCardWrapper>
                <div>
                    <TextInput
                        autoComplete={'cc-number'}
                        label={t('cart_checkout_card_number')}
                        inputMode={'numeric'}
                        placeholder={'ex: 4242 4242 4242 4242'}
                        options={{ creditCard: true }}
                        name={'test'}
                        onChange={(e) => setCardNumber(e.target.value === '' ? null : e.target.value)}
                        error={focused !== 'card_number' && !cardNumberValid ? ' ' : undefined}
                        onFocus={() => {
                            setFocused('card_number');
                        }}
                        onBlur={() => {
                            setFocused(null);
                        }}
                    />
                    <div/>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: theme.regularSpacing,
                    }}>
                        <div
                            style={{
                                width: '50%'
                            }}
                        >
                            <TextInput
                                autoComplete={'cc-exp'}
                                label={t('cart_checkout_card_expiry')}
                                inputMode={'numeric'}
                                placeholder={'ex: 02/42'}
                                options={{
                                    date: true,
                                    datePattern: ['m', 'y'],
                                }}
                                name={'test'}
                                onChange={(e) => setCardExpiry(e.target.value === '' ? null : e.target.value)}
                                error={focused !== 'card_expiry' && !cardExpiryValid ? ' ' : undefined}
                                onFocus={() => {
                                    setFocused('card_expiry');
                                }}
                                onBlur={() => {
                                    setFocused(null);
                                }}
                            />
                        </div>
                        <div
                            style={{
                                marginLeft: theme.regularSpacing,
                                width: `calc(50% - ${theme.regularSpacing})`
                            }}
                        >
                            <TextInput
                                autoComplete={'cc-csc'}
                                label={t('cart_checkout_card_cvc')}
                                inputMode={'numeric'}
                                placeholder={'ex: 242'}
                                options={{
                                    blocks: [3],
                                    numericOnly: true,
                                }} name={'test'}
                                onChange={(e) => setCardCcv(e.target.value === '' ? null : e.target.value)}
                                error={focused !== 'card_cvc' && !cardCcvValid ? ' ' : undefined}
                                onFocus={() => {
                                    setFocused('card_cvc');
                                }}
                                onBlur={() => {
                                    setFocused(null);
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: theme.regularSpacing }}>
                        <TextInput
                            label={t('cart_checkout_full_name')}
                            name={t('cart_checkout_full_name')}
                            placeholder={'ex: Jane Doe'}
                            onChange={(e) => {
                                setFullName(e.target.value);
                            }}/>
                    </div>
                </div>
            </CreditCardWrapper>
            <MediaQuery maxWidth={900}>
                <DoubleButtonCta
                    ctaLabel={t('pay')}
                    secondaryLabel={t('back')}
                    show={cart.open}
                    onClick={handleSubmit}
                    loading={submitted}
                    variant={submittable ? 'custom' : 'disabled'}
                    onSecondaryClick={props.back}
                />
            </MediaQuery>
            <MediaQuery minWidth={901}>
                <Actions>
                    <TextButton onClick={props.back}>{t('back')}</TextButton>
                    <ButtonWrapper>
                        <Button
                            loadingState={submitted}
                            title={t('pay')}
                            variant={submittable ? 'primary' : 'disabled'}
                            onClick={handleSubmit}
                        />
                    </ButtonWrapper>
                </Actions>
            </MediaQuery>
        </Container>;
    };
