import { CartState, SetTickets }                   from '../../../redux/ducks/cart';
import { StripeSDK }                               from '../../../utils/useCustomStripe';
import styled, { useTheme }                        from 'styled-components';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation }                          from 'react-i18next';
import { useDispatch, useSelector }                from 'react-redux';
import { T721AppState }                            from '../../../redux';
import { Theme }                                   from '@frontend/flib-react/lib/config/theme';
import { useHistory }                              from 'react-router';
import { getCartTotal, getServiceFees }            from '../SyncedCart/types';
import { useDeepEffect }                           from '@frontend/core/lib/hooks/useDeepEffect';
import { PushNotification }                        from '@frontend/core/lib/redux/ducks/notifications';
import Countdown                                   from 'react-countdown';
import { PurchaseTotal, TextInput }                from '@frontend/flib-react/lib/components';
import { PayCta }                                  from './PayCta';
import { ActionSetEntity }                         from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';

export interface StripeCheckoutNativeProps {
    remoteCart: ActionSetEntity;
    cart: CartState;
    stripe: StripeSDK;
}

const getClosestExpiration = (authorizationData: any): Date => {

    let closest = null;
    const now = Date.now();

    for (const authorization of authorizationData.authorizations) {
        const expiration = new Date(authorization.expiration);

        if (expiration.getTime() < now) {
            closest = null;
            break;
        }

        if (closest === null || expiration.getTime() < closest.getTime()) {
            closest = expiration;
        }
    }

    if (closest === null) {
        return null;
    }

    return new Date(closest.getTime() - (1000 * 60 * 60));
};

const ProceedToCheckoutTitle = styled.h1`
  margin-top: ${props => props.theme.regularSpacing};
  margin-left: ${props => props.theme.regularSpacing};
  margin-bottom: ${props => props.theme.smallSpacing};
`;

export interface CountdownProps {
    alert?: string;
}

const CountdownText = styled.h2<CountdownProps>`
  font-size: 15px;
  text-transform: uppercase;
  font-weight: 300;
  opacity: ${props => props.alert ? '1' : '0.7'};
  margin-left: ${props => props.theme.regularSpacing};
  color: ${props => props.alert ? props.theme[`${props.alert}`].hex : props.theme.textColor};
`;

const NumberText = styled.span<CountdownProps>`
  font-size: 17px;
  font-family: 'Roboto Mono', monospace;
`;

const CreditCardWrapper = styled.div`
  margin-bottom: ${props => props.theme.regularSpacing};
  padding: ${props => props.theme.regularSpacing};
`;

const Container = styled.div`
    padding-bottom: calc(80px + ${props => props.theme.regularSpacing});
`;

const renderer = (
    expiresInLabel: string,
    { hours, minutes, seconds, completed }: { hours: number; minutes: number; seconds: number; completed: boolean },
) => {
    if (completed) {
        return null;
    } else {

        let alert: string;

        if (hours === 0) {

            if (minutes < 15) {
                alert = 'warningColor';
            }

            if (minutes < 5) {
                alert = 'errorColor';
            }
        }

        return (
            <CountdownText alert={alert}>
                {expiresInLabel} <NumberText>{hours}</NumberText>h <NumberText>{minutes}</NumberText>m{' '}
                <NumberText>{seconds}</NumberText>s
            </CountdownText>
        );
    }
};

const isSubmittable = (...args: any[]): boolean => {
    return !!args.reduce((a: any, b: any) => !!a && !!b);
};

export const StripeCheckoutNative: React.FC<StripeCheckoutNativeProps> = (props: StripeCheckoutNativeProps): JSX.Element => {

    const authorizationData = JSON.parse(props.remoteCart.actions[2].data);
    const ticketSelectionData = JSON.parse(props.remoteCart.actions[0].data);
    const [closestExpiration, setClosestExpiration] = useState(getClosestExpiration(authorizationData));
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
    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const dispatch = useDispatch();
    const history = useHistory();
    const totalItems = getCartTotal(props.cart.tickets, ticketSelectionData.total.map(i => i.value));
    const serviceFeeItems = getServiceFees(t('synced_cart_processing_fees'), ticketSelectionData.fees, totalItems);
    const submittable = isSubmittable(fullName, cardNumber, cardCcv, cardExpiry, cardNumberValid, cardCcvValid, cardExpiryValid);
    const theme = useTheme() as Theme;

    useDeepEffect(() => {

        if (cardNumber !== null) {

            const timeoutId = setTimeout(async () => {
                const { valid } = await stripe.validateCardNumber({ number: cardNumber });
                setCardNumberValidity(valid);
            }, 1000);
            return () => {
                clearTimeout(timeoutId);
            }

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
                }
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
                }

            } else {
                setCardCcvValidity(false);
            }

        }

    }, [cardCcv, stripe]);

    // Callback to clear the cart
    const clearCart = useCallback(() => {
        dispatch(SetTickets([]));
        history.go(-history.length);
        history.push('/wallet');
    }, [dispatch, history]);

    useEffect(() => {

        window.scrollTo(0, 0);

    }, []);

    // Final callback on component destruction
    useEffect(() => {

        return () => {
            if (submitted) {
                clearCart();
                dispatch(PushNotification(t('cart_checkout_tickets_created'), 'success'));
            }
        };
    }, [submitted, clearCart, dispatch, t]);

    // Compute the expiration time
    useDeepEffect(() => {
        setClosestExpiration(getClosestExpiration(authorizationData));
    }, [authorizationData]);

    // Callback to reset the cart completely
    const forceResetCart = useCallback(async () => {
        return (window as any).t721Sdk.actions.consumeUpdate(token, props.remoteCart.id, {
            consumed: true,
        });
    }, [token, props.remoteCart]);

    // Callback to handle payment submission
    const handleSubmit = async () => {

        if (!submittable) {
            return;
        }

        const {error} = await stripe.confirmPaymentIntent({
            clientSecret: authorizationData.clientSecret,
            card: {
                number: cardNumber.split(' ').join(''),
                exp_month: cardExpiry.slice(0, 2),
                exp_year: cardExpiry.slice(3),
                cvc: cardCcv,
                name: fullName,
            }
        });

        if (error) {
            dispatch(PushNotification(error.message, 'error'));
            await forceResetCart();
            return;
        }

        try {
            await (window as any).t721Sdk.checkout.cart.resolve.paymentIntent(
                token,
                {
                    cart: props.remoteCart.id,
                },
            );
            setSubmitted(true);
        } catch (e) {
            dispatch(PushNotification(t(e.response.data.message), 'error'));
            await forceResetCart();
            return;
        }

    };

    // Callback triggered when authorization expirations end
    const onExpirationComplete = useCallback(() => {
        forceResetCart()
            .then(() => {
                dispatch(PushNotification(t('cart_checkout_expired'), 'error'));
                history.replace('/');
            })
            .catch((e) => {
                console.error(e);
                dispatch(PushNotification(t('cart_checkout_expired'), 'error'));
                history.replace('/');
            });
    }, [dispatch, history, t, forceResetCart]);

    useEffect(() => {
        if (closestExpiration === null) {
            onExpirationComplete();
        }
    }, [closestExpiration, onExpirationComplete]);

    return <Container>
        <ProceedToCheckoutTitle>{t('cart_checkout_title')}</ProceedToCheckoutTitle>
        <Countdown onComplete={onExpirationComplete} date={closestExpiration ? closestExpiration.getTime() : new Date(Date.now() - 1000).getTime()}
                   renderer={renderer.bind(null, t('cart_checkout_expires_in'))}/>
        <CreditCardWrapper>
            <div>
                <TextInput
                    autoComplete={'cc-number'}
                    label={t('cart_checkout_card_number')}
                    type={'number'}
                    placeholder={'ex: 4242 4242 4242 4242'}
                    options={{creditCard: true}}
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
                    marginTop: theme.regularSpacing
                }}>
                    <div>
                        <TextInput
                            autoComplete={'cc-exp'}
                            label={t('cart_checkout_card_expiry')}
                            type={'number'}
                            placeholder={'ex: 02/42'}
                            options={{
                                date: true,
                                datePattern: ['m', 'y']
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
                    <div style={{marginLeft: theme.regularSpacing}}>
                        <TextInput
                            autoComplete={'cc-csc'}
                            label={t('cart_checkout_card_cvc')}
                            type={'number'}
                            placeholder={'ex: 242'}
                            options={{
                                blocks: [3],
                                numericOnly: true
                            }}  name={'test'}
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
                <div style={{marginTop: theme.regularSpacing}}>
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
        <PurchaseTotal
            totalLabel={t('synced_cart_total')}
            subtotalLabel={t('synced_cart_subtotal')}
            label={t('synced_cart_total_title')}
            total={totalItems}
            fees={[
                ...serviceFeeItems,
            ]}
        />
        <PayCta show={true} onClick={handleSubmit} cart={props.remoteCart} submitted={submitted} disabled={!submittable}
                onSecondaryClick={forceResetCart}/>
    </Container>;
};
