import React, { useContext, useEffect, useState } from 'react';
import { CartContext }               from '../Cart/CartContext';
import styled, { useTheme }          from 'styled-components';
import { Icon }                      from '@frontend/flib-react/lib/components';
import { Theme }                     from '@frontend/flib-react/lib/config/theme';
import { useLazyRequest }            from '@frontend/core/lib/hooks/useLazyRequest';
import { PurchasesCloseResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/purchases/dto/PurchasesCloseResponse.dto';
import { v4 }               from 'uuid';
import { useDispatch }      from 'react-redux';
import { useToken }         from '@frontend/core/lib/hooks/useToken';
import { isNil }            from 'lodash';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';
import { PurchaseError }    from '@common/sdk/lib/@backend_nest/libs/common/src/purchases/ProductChecker.base.service';
import { useTranslation }   from 'react-i18next';
import { TicketsContext }   from '@frontend/core/lib/contexts/TicketsContext';
import { getEnv }           from '@frontend/core/lib/utils/getEnv';
import { timing }           from '@frontend/core/lib/tracking/timing';
import { event }            from '@frontend/core/lib/tracking/registerEvent';

const Container = styled.div`
  height: calc(100% - 50px);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const Title = styled.span`
  margin: 0;
  font-weight: 600;
  margin-bottom: ${props => props.theme.regularSpacing};
`

// tslint:disable-next-line:no-empty-interface
export interface CartMenuStripeConfirmedPurchaseProps {

}

const CartMenuStripeConfirmedPurchase: React.FC<CartMenuStripeConfirmedPurchaseProps> =
    (props: CartMenuStripeConfirmedPurchaseProps): JSX.Element => {

        const theme = useTheme() as Theme;
        const [t] = useTranslation('cart');

        return <Container>
            <Title>{t('purchase_success')}</Title>
            <Icon
                icon={'purchase_success'}
                size={'75px'}
                color={theme.primaryColor.hex}
            />
        </Container>
    }

// tslint:disable-next-line:no-empty-interface
export interface CartMenuStripeRejectedPurchaseProps {

}

const CartMenuStripeRejectedPurchase: React.FC<CartMenuStripeRejectedPurchaseProps> =
    (props: CartMenuStripeRejectedPurchaseProps): JSX.Element => {

        const theme = useTheme() as Theme;
        const [t] = useTranslation('cart');

        return <Container>
            <Title>{t('purchase_rejected')}</Title>
            <Icon
                icon={'purchase_rejected'}
                size={'75px'}
                color={theme.errorColor.hex}
            />
        </Container>
    }

const generateErrorMessage = (t: any, error: PurchaseError): string => {
    return t(error.reason, error.context);
}


// tslint:disable-next-line:no-empty-interface
export interface CartMenuStripeEndedPurchaseProps {

}

export const CartMenuStripeEndedPurchase: React.FC<CartMenuStripeEndedPurchaseProps> = (props: CartMenuStripeEndedPurchaseProps): JSX.Element => {

    const cart = useContext(CartContext);
    const [t] = useTranslation('cart');
    const [uuid] = useState(v4());
    const token = useToken();
    const closeLazyRequest = useLazyRequest<PurchasesCloseResponseDto>('purchases.close', uuid);
    const dispatch = useDispatch();
    const tickets = useContext(TicketsContext);

    useEffect(() => {
            setTimeout(() => {

                closeLazyRequest.lazyRequest([
                    token,
                    `${getEnv().REACT_APP_SELF}`,
                    v4()
                ]);

            }, 1000);
        },
        // eslint-disable-next-line
        [token]);

    useEffect(() => {
            if (closeLazyRequest.response.called) {
                if (closeLazyRequest.response.data) {
                    const data = closeLazyRequest.response.data;
                    const time = (new Date().getTime()) - new Date(cart.cart.checked_out_at).getTime();
                    if (data.errors.filter((elem): boolean => !isNil(elem)).length > 0) {
                        const errors = data.errors.filter((elem): boolean => !isNil(elem))
                        for (const error of errors) {
                            dispatch(PushNotification(generateErrorMessage(t, error), 'error'))
                        }
                        timing('Purchase', 'checkout', time, 'failure');
                        event(
                            'Purchase',
                            'Cart checkout ended',
                            'User proceeds to payment',
                            'failure'
                        );
                    } else {
                        cart.force(parseInt(getEnv().REACT_APP_ERROR_THRESHOLD, 10));
                        tickets.force(parseInt(getEnv().REACT_APP_ERROR_THRESHOLD, 10));
                        timing('Purchase', 'checkout', time, 'success');
                        event(
                            'Purchase',
                            'Cart checkout ended',
                            'User proceeds to payment',
                            'success'
                        );
                    }

                }
            }
        },
        // eslint-disable-next-line
        [closeLazyRequest.response.data, closeLazyRequest.response.error, closeLazyRequest.response.called]);


    switch (cart.cart.payment.status) {
        case 'confirmed': {
            return <CartMenuStripeConfirmedPurchase/>
        }
        case 'rejected': {
            return <CartMenuStripeRejectedPurchase/>
        }
    }

}
