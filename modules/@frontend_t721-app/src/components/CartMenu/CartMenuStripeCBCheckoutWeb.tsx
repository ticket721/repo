import React, { useContext, useState } from 'react';
import { TextInput, DoubleButtonCta, Button } from '@frontend/flib-react/lib/components';
import styled, { useTheme }           from 'styled-components';
import { Theme }                      from '@frontend/flib-react/lib/config/theme';
import { useTranslation }             from 'react-i18next';
import { useDeepEffect }              from '@frontend/core/lib/hooks/useDeepEffect';
import { useElements }                from '@stripe/react-stripe-js';
import { PushNotification }           from '@frontend/core/lib/redux/ducks/notifications';
import { StripeSDK }                  from '@frontend/core/lib/utils/StripeSDKContext';
import { CartContext }                from '../Cart/CartContext';
import { useDispatch }                from 'react-redux';
import { UserContext }                from '@frontend/core/lib/utils/UserContext';
import { getEnv }                     from '@frontend/core/lib/utils/getEnv';
import MediaQuery from 'react-responsive';

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

const Actions = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 64px ${props => props.theme.regularSpacing} 0;
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

const isSubmittable = (...args: any[]): boolean => {
    return !!args.reduce((a: any, b: any) => !!a && !!b);
};

interface CartMenuStripeCBCheckoutWebProps {
    stripe: StripeSDK;
    back: () => void;
}

export const CartMenuStripeCBCheckoutWeb: React.FC<CartMenuStripeCBCheckoutWebProps> = (props: CartMenuStripeCBCheckoutWebProps): JSX.Element => {

    const cart = useContext(CartContext);
    const theme = useTheme() as Theme;
    const [t] = useTranslation('cart');
    const [fullName, setFullName] = useState(null);
    const [cardNumber, setCardNumber] = useState(null);
    const [cardNumberComplete, setCardNumberComplete] = useState(false);
    const [cardCcvComplete, setCardCcvComplete] = useState(false);
    const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const elements = useElements();
    const submittable = isSubmittable(elements, fullName, cardNumberComplete, cardCcvComplete, cardExpiryComplete, cart.cart);
    const dispatch = useDispatch();
    const user = useContext(UserContext);

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

    // Callback to handle payment submission
    const handleSubmit = async () => {

        if (!submittable || !cart.cart?.payment) {
            return;
        }

        const paymentInfos = JSON.parse(cart.cart.payment.client_id);

        setSubmitted(true);

        const { error } = await props.stripe.stripe.confirmCardPayment(paymentInfos.client_secret, {
            payment_method: {
                card: cardNumber,
                billing_details: {
                    name: fullName,
                    email: user.email
                },
            },
        });

        if (error) {
            dispatch(PushNotification(error.message, 'error'));
            setSubmitted(false);
            return;
        }

        cart.force(parseInt(getEnv().REACT_APP_ERROR_THRESHOLD, 10));

    };

    return <Container>
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
