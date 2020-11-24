import React, { useEffect, useState }      from 'react';
import styled, { useTheme }                from 'styled-components';
import { Theme }                           from '@frontend/flib-react/lib/config/theme';
import { useTranslation }                  from 'react-i18next';
import { v4 }                              from 'uuid';
import { useDispatch }        from 'react-redux';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import { useLazyRequest }                  from '@frontend/core/lib/hooks/useLazyRequest';
import { PurchasesSetProductsResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/purchases/dto/PurchasesSetProductsResponse.dto';
import { isNil }                           from 'lodash';
import { PushNotification }                from '@frontend/core/lib/redux/ducks/notifications';
import { PurchaseError }                   from '@common/sdk/lib/@backend_nest/libs/common/src/purchases/ProductChecker.base.service';
import { CartState }                       from '../Cart/CartContext';
import { CartMenuStripeCBCheckout }        from './CartMenuStripeCBCheckout';
import { getEnv }                          from '@frontend/core/lib/utils/getEnv';
import { useCustomStripe }                 from '@frontend/core/lib/utils/useCustomStripe';
import { useApplePay }                         from './useApplePay';
import { PaymentButtonDiv, PaymentButtonIcon } from './PaymentButton';

const ComingSoonText = styled.span`
  opacity: 0.7;
  margin: 0;
  font-size: 10px;
`;


const ButtonContainer = styled.div`
  height: 100%;
  overflow: scroll;
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
    const token = useToken();
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
                {
                    apple.available && apple.Button

                        ?
                        apple.Button

                        :
                        null
                }

                <PaymentButtonDiv
                    disabled={true}
                    color={'#ffffff'}
                    textColor={'#000000'}
                >
                    <span>{t('pay_with')}</span>
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
                    <span>{t('pay_with')}</span>
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
                    <span>{t('cancel')}</span>
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

