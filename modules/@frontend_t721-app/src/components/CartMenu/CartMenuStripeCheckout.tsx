import React, { useEffect, useState }      from 'react';
import styled, { useTheme }                from 'styled-components';
import { Theme }                           from '@frontend/flib-react/lib/config/theme';
import { Icon }                            from '@frontend/flib-react/lib/components';
import { useTranslation }                  from 'react-i18next';
import { v4 }                              from 'uuid';
import { useDispatch, useSelector }        from 'react-redux';
import { T721AppState }                    from '../../redux';
import { useLazyRequest }                  from '@frontend/core/lib/hooks/useLazyRequest';
import { PurchasesSetProductsResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/purchases/dto/PurchasesSetProductsResponse.dto';
import { isNil }                           from 'lodash';
import { PushNotification }                from '@frontend/core/lib/redux/ducks/notifications';
import { PurchaseError }                   from '@common/sdk/lib/@backend_nest/libs/common/src/purchases/ProductChecker.base.service';
import { CartState }                       from '../Cart/CartContext';
import { CartMenuStripeCBCheckout }        from './CartMenuStripeCBCheckout';
import { getEnv }                          from '@frontend/core/lib/utils/getEnv';
import { useCustomStripe }                 from '@frontend/core/lib/utils/useCustomStripe';
import { useApplePay }                     from './useApplePay';

interface PaymentButtonDivProps {
    color: string;
    textColor: string;
    disabled: boolean;
}

const PaymentButtonDiv = styled.div<PaymentButtonDivProps>`
  opacity: ${props => props.disabled ? '0.1' : '1'};
  width: 80%;
  margin: ${props => props.theme.regularSpacing};
  border-radius: ${props => props.theme.defaultRadius};
  background-color: ${props => props.color};
  padding: ${props => props.theme.regularSpacing};
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;

  & span {
    color: ${props => props.textColor};
  }
`;

const ComingSoonText = styled.span`
  opacity: 0.7;
  margin: 0;
  font-size: 10px;
`;

interface PaymentButtonIconProps {
    loading?: boolean;
}

const PaymentButtonIcon = styled(Icon)<PaymentButtonIconProps>`

  @keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
  }

  ${props => props.loading

    ?
    `animation: rotate 1s infinite;`

    :
    ``
}
  margin-left: ${props => props.theme.smallSpacing};
  display: inline;
`;

const ButtonContainer = styled.div`
  height: calc(100% - 120px - env(safe-area-inset-bottom));
  height: calc(100% - 120px - constant(safe-area-inset-bottom));
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const generateErrorMessage = (t: any, error: PurchaseError): string => {
    return t(error.reason, error.context);
};

export interface CartMenuStripeCheckoutProps {
    cart: CartState;
}

export const CartMenuStripeCheckout: React.FC<CartMenuStripeCheckoutProps> = (props: CartMenuStripeCheckoutProps) => {

    const [t] = useTranslation('cart');
    const theme = useTheme() as Theme;
    const [uuid] = useState(v4());
    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [capturedTimesstamp, setTimestamp] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const dispatch = useDispatch();
    const paymentInfos = JSON.parse(props.cart.cart.payment.client_id);
    const sdk = useCustomStripe({
        stripe_account: paymentInfos.stripe_account,
    });
    const apple = useApplePay(sdk, props.cart);

    const setProductsLazyRequest = useLazyRequest<PurchasesSetProductsResponseDto>('purchases.setProducts', uuid);

    useEffect(() => {
            if (setProductsLazyRequest.response.called) {
                if (setProductsLazyRequest.response.error) {
                    setTimestamp(null);
                } else if (setProductsLazyRequest.response.data) {

                    const data = setProductsLazyRequest.response.data;
                    if (data.errors.filter((elem): boolean => !isNil(elem)).length > 0) {
                        const errors = data.errors.filter((elem): boolean => !isNil(elem));
                        for (const error of errors) {
                            dispatch(PushNotification(generateErrorMessage(t, error), 'error'));
                        }
                        setTimestamp(null);
                    } else {
                        props.cart.force(parseInt(getEnv().REACT_APP_ERROR_THRESHOLD, 10));
                    }

                }
            }
        },
        // eslint-disable-next-line
        [setProductsLazyRequest.response.data, setProductsLazyRequest.response.error, setProductsLazyRequest.response.called]);

    const onClear = () => {
        setProductsLazyRequest.lazyRequest([
            token,
            {
                products: [],
            },
            v4(),
        ], {
            force: true,
        });
        setTimestamp(props.cart.last_update);
    };

    const loading = (capturedTimesstamp !== null && capturedTimesstamp === props.cart.last_update);

    switch (paymentMethod) {

        case 'cb': {

            if (!props.cart.cart?.payment) {
                return null;
            }

            return <CartMenuStripeCBCheckout
                stripeAccount={paymentInfos.stripe_account}
                sdk={sdk}
                back={() => setPaymentMethod(null)}
            />;
        }

        case null: {
            return <ButtonContainer>
                <PaymentButtonDiv
                    disabled={!apple.available}
                    color={'#000000'}
                    textColor={'#ffffff'}
                    onClick={apple.pay}
                >
                    <span>Pay with</span>
                    <PaymentButtonIcon
                        icon={'applepay'}
                        size={'18px'}
                        color={'#ffffff'}
                    />
                </PaymentButtonDiv>

                <PaymentButtonDiv
                    disabled={true}
                    color={'#ffffff'}
                    textColor={'#000000'}
                >
                    <span>Pay with</span>
                    <PaymentButtonIcon
                        icon={'googlepay'}
                        size={'18px'}
                        color={'#000000'}
                    />
                </PaymentButtonDiv>

                <PaymentButtonDiv
                    disabled={false}
                    color={theme.primaryColorGradientEnd.hex}
                    textColor={'#ffffff'}
                    onClick={() => {
                        setPaymentMethod('cb');
                    }}
                >
                    <span>Pay with</span>
                    <PaymentButtonIcon
                        icon={'credit-card'}
                        size={'18px'}
                        color={'#ffffff'}
                    />
                </PaymentButtonDiv>

                <PaymentButtonDiv
                    disabled={false}
                    color={theme.errorColor.hex}
                    textColor={'#ffffff'}
                    onClick={onClear}
                >
                    <span>Cancel</span>
                    <PaymentButtonIcon
                        icon={loading ? 'loader' : 'close'}
                        loading={loading}
                        size={'14px'}
                        color={'#ffffff'}
                    />
                </PaymentButtonDiv>

                <ComingSoonText>{t('coming_soon')}</ComingSoonText>

            </ButtonContainer>;
        }
    }

};

