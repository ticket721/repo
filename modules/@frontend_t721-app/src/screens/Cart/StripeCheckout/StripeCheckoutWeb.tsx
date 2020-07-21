import { CartState, SetTickets }                   from '../../../redux/ducks/cart';
import { StripeSDK }                               from '../../../utils/useCustomStripe';
import styled, { useTheme }                        from 'styled-components';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation }                          from 'react-i18next';
import { useElements }                             from '@stripe/react-stripe-js';
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

export interface StripeCheckoutWebProps {
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

const CardInputElement = styled.label`
    margin-top: ${props => props.theme.regularSpacing};
    position: relative;
    background-color: ${(props) => props.theme.componentColor};
    border-radius: ${(props) => props.theme.defaultRadius};
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: ${(props) => props.theme.biggerSpacing} ${(props) => props.theme.regularSpacing} ${(props) => props.theme.regularSpacing} 1.5rem;
    transition: background-color 300ms ease;

    & span {
      display: inline-flex;
      transform: translateX(-12px);
      transition: all 300ms ease;
      margin-bottom: ${props => props.theme.regularSpacing};

      &::before {
          background-color: ${(props) => props.theme.primaryColor.hex};
          border-radius: 100%;
          content: '';
          display: inline-block;
          height: 4px;
          margin-right: 8px;
          opacity: 0;
          position: relative;
          top: 2px;
          transition: opacity 300ms ease;
          width: 4px;
      }
    }

    &:hover {
        background-color: ${(props) => props.theme.componentColorLight};
    }

    &:focus-within {
        background-color: ${(props) => props.theme.componentColorLighter};

        & span {
            transform: translateX(0px);

            &::before {
                opacity: 1;
            }
         }
    }

    .sub-container {
        display: flex;
        align-items: center;
        padding-left: 1.5rem;

        & > span {
            margin-right: 0.7rem;
            margin-bottom: 5px;
        }

        & > :not(span) {
            width: 100%;
            padding: 1rem 1.5rem 1rem 0;
        }
    }
`;

const NameInputWrapper = styled.div`
  margin-top: ${props => props.theme.regularSpacing};
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

export const StripeCheckoutWeb: React.FC<StripeCheckoutWebProps> = (props: StripeCheckoutWebProps): JSX.Element => {

    const authorizationData = JSON.parse(props.remoteCart.actions[2].data);
    const ticketSelectionData = JSON.parse(props.remoteCart.actions[0].data);
    const [closestExpiration, setClosestExpiration] = useState(getClosestExpiration(authorizationData));
    const [fullName, setFullName] = useState(null);
    const [cardNumber, setCardNumber] = useState(null);
    const [cardNumberComplete, setCardNumberComplete] = useState(false);
    const [cardCcvComplete, setCardCcvComplete] = useState(false);
    const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [t] = useTranslation('cart');
    const elements = useElements();
    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const theme = useTheme() as Theme;
    const dispatch = useDispatch();
    const history = useHistory();
    const totalItems = getCartTotal(props.cart.tickets, ticketSelectionData.total.map(i => i.value));
    const serviceFeeItems = getServiceFees(t('synced_cart_processing_fees'), ticketSelectionData.fees, totalItems);
    const submittable = isSubmittable(elements, fullName, cardNumberComplete, cardCcvComplete, cardExpiryComplete);

    // Stripe Elements registration
    useDeepEffect(() => {

        if (!elements) {
            return;
        }

        const cardNumberElement = elements.create('cardNumber', {
            placeholder: '4242 4242 4242 4242',
            style: {
                base: {
                    color: theme.textColor,
                },
                invalid: {
                    color: theme.errorColor.hex,
                },
            },
        });
        cardNumberElement.mount('#card-number-element');

        const cardExpiryElement = elements.create('cardExpiry', {
            placeholder: '02/42',
            style: {
                base: {
                    color: theme.textColor,
                },
                invalid: {
                    color: theme.errorColor.hex,
                },
            },

        });
        cardExpiryElement.mount('#card-expiry-element');

        const cardCvcElement = elements.create('cardCvc', {
            placeholder: '424',
            style: {
                base: {
                    color: theme.textColor,
                },
                invalid: {
                    color: theme.errorColor.hex,
                },
            },
        });
        cardCvcElement.mount('#card-cvc-element');

        cardNumberElement.on('change', (value: any) => setCardNumberComplete(value.complete));
        cardExpiryElement.on('change', (value: any) => setCardExpiryComplete(value.complete));
        cardCvcElement.on('change', (value: any) => setCardCcvComplete(value.complete));

        setCardNumber(cardNumberElement);

        return () => {
            if (elements) {
                cardCvcElement.destroy();
                cardNumberElement.destroy();
                cardExpiryElement.destroy();
            }
        };
    }, [!!elements]);

    useEffect(() => {

        window.scrollTo(0, 0);

    }, []);

    // Compute the expiration time
    useDeepEffect(() => {
        setClosestExpiration(getClosestExpiration(authorizationData));
    }, [authorizationData]);

    // Callback to reset the cart completely
    const forceResetCart = async () => {
        return (window as any).t721Sdk.actions.consumeUpdate(token, props.remoteCart.id, {
            consumed: true,
        });
    };

    // Callback to handle payment submission
    const handleSubmit = async () => {

        if (!submittable) {
            return;
        }

        const { error } = await props.stripe.stripe.confirmCardPayment(authorizationData.clientSecret, {
            payment_method: {
                card: cardNumber,
                billing_details: {
                    name: fullName,
                },
            },
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
        dispatch(SetTickets([]));
        dispatch(PushNotification(t('cart_checkout_expired'), 'error'));
        history.replace('/');
    }, [dispatch, history, t]);

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
            <CardInputElement>
                <span>{t('cart_checkout_card_number')}</span>

                <div id='card-number-element' className='field'/>
            </CardInputElement>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <CardInputElement>
                    <span>{t('cart_checkout_card_expiry')}</span>
                    <div id='card-expiry-element' className='field'/>
                </CardInputElement>
                <CardInputElement style={{ marginLeft: theme.regularSpacing }}>
                    <span>{t('cart_checkout_card_cvc')}</span>
                    <div id='card-cvc-element' className='field'/>
                </CardInputElement>
            </div>
            <NameInputWrapper>
                <TextInput label={t('cart_checkout_full_name')} name={t('cart_checkout_full_name')} placeholder={'Jane Doe'} onChange={(e) => {
                    setFullName(e.target.value);
                }}/>
            </NameInputWrapper>
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
