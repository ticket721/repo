import React, { useContext }           from 'react';
import { CartContext }                 from '../Cart/CartContext';
import { CartMenuStripeCheckout }      from './CartMenuStripeCheckout';
import { CartMenuStripeEndedPurchase } from './CartMenuStripeEndedPurchase';
import styled                          from 'styled-components';
import { useTranslation }              from 'react-i18next';
import { getPrice }                    from '@frontend/core/lib/utils/prices';

// tslint:disable-next-line:no-empty-interface
interface CartMenuNoneCheckoutProps {
}

const CartMenuNoneCheckout: React.FC<CartMenuNoneCheckoutProps> = (props: CartMenuNoneCheckoutProps) => {
    return null;
}

const PriceContainer = styled.div`
  height: 70px;
  width: 100%;
  background-color: ${props => props.theme.componentColor};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.regularSpacing};
`

const PriceSectionContainer = styled.div`
  text-align: end;
  display: flex;
  flex-direction: column;
`

const PriceText = styled.span`
  margin: ${props => props.theme.smallSpacing};
`

const PriceTextFee = styled.span`
  margin: ${props => props.theme.smallSpacing};
  margin-top: 0;
  font-size: 14px;
  opacity: 0.5;
`

const aggregateFees = (cart) => {
    if (cart.fees.length) {
        return cart.fees
            .map(fee => fee.price)
            .reduce((f1, f2) => f1 + f2)
    }
    return 0
}

interface CartMenuCheckoutProps {
    height: number;
}

export const CartMenuCheckout: React.FC<CartMenuCheckoutProps> = (props: CartMenuCheckoutProps) => {

    const cart = useContext(CartContext);
    const [t] = useTranslation('cart');

    if (!cart.cart) {
        return null;
    }

    if (cart.cart.payment.status !== 'waiting') {
        return <CartMenuStripeEndedPurchase/>;
    }

    const fee = aggregateFees(cart.cart);

    switch (cart.cart.payment_interface) {
        case null: {
            return <div
                style={{
                    overflow: 'scroll'
                }}
            >
                <PriceContainer>
                    <PriceText>{t('total')}</PriceText>
                    <PriceSectionContainer>
                        <PriceText>{getPrice(cart.cart as any, t('free'))}</PriceText>
                        {
                            fee > 0

                                ?
                                <PriceTextFee>
                                    {t('including_fees', {price: getPrice({price: fee, currency: cart.cart.currency} as any, t('free'))})}
                                </PriceTextFee>

                                :
                                <PriceTextFee>
                                    {t('no_fees')}
                                </PriceTextFee>
                        }
                    </PriceSectionContainer>
                </PriceContainer>
                <div style={{
                }}
                >
                    <CartMenuNoneCheckout />
                </div>
            </div>
        }
        case 'stripe': {
            return <div
                style={{
                    overflow: 'scroll'
                }}
            >
                <PriceContainer>
                    <PriceText>{t('total')}</PriceText>
                    <PriceSectionContainer>
                        <PriceText>{getPrice(cart.cart as any, t('free'))}</PriceText>
                        {
                            fee > 0

                                ?
                                <PriceTextFee>
                                    {t('including_fees', {price: getPrice({price: fee, currency: cart.cart.currency} as any, t('free'))})}
                                </PriceTextFee>

                                :
                                <PriceTextFee>
                                    {t('no_fees')}
                                </PriceTextFee>
                        }
                    </PriceSectionContainer>
                </PriceContainer>
                <div style={{
                    height: props.height - 70
                }}
                >
                    <CartMenuStripeCheckout cart={cart}/>
                </div>
            </div>
        }
    }
}
