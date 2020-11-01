import React, { useContext }           from 'react';
import { CartContext }                 from '../Cart/CartContext';
import { CartMenuStripeCheckout }      from './CartMenuStripeCheckout';
import { CartMenuStripeEndedPurchase } from './CartMenuStripeEndedPurchase';
import styled                          from 'styled-components';
import { getPrice }                    from '../../utils/prices';
import { useTranslation }              from 'react-i18next';

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

export const CartMenuCheckout = () => {

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
            return <>
                <PriceContainer>
                    <PriceText>TOTAL</PriceText>
                    <PriceSectionContainer>
                        <PriceText>{getPrice(cart.cart as any, t('free'))}</PriceText>
                        {
                            fee > 0

                                ?
                                <PriceTextFee>{t('including_fees', {price: getPrice({price: fee, currency: cart.cart.currency} as any, t('free'))})}</PriceTextFee>

                                :
                                null
                        }
                    </PriceSectionContainer>
                </PriceContainer>
                <CartMenuNoneCheckout />
            </>
        }
        case 'stripe': {
            return <>
                <PriceContainer>
                    <PriceText>TOTAL</PriceText>
                    <PriceSectionContainer>
                        <PriceText>{getPrice(cart.cart as any, t('free'))}</PriceText>
                        {
                            fee > 0

                                ?
                                <PriceTextFee>{t('including_fees', {price: getPrice({price: fee, currency: cart.cart.currency} as any, t('free'))})}</PriceTextFee>

                                :
                                null
                        }
                    </PriceSectionContainer>
                </PriceContainer>
                <CartMenuStripeCheckout />
            </>
        }
    }
}
