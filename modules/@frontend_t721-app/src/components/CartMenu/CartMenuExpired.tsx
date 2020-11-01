import React, { useContext, useEffect, useState } from 'react';
import { useTranslation }                         from 'react-i18next';
import { Button }                                 from '@frontend/flib-react/lib/components';
import { v4 }                                     from 'uuid';
import { useDispatch, useSelector }               from 'react-redux';
import { T721AppState }                           from '../../redux';
import { useLazyRequest }                         from '@frontend/core/lib/hooks/useLazyRequest';
import { PurchasesSetProductsResponseDto }        from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/purchases/dto/PurchasesSetProductsResponse.dto';
import { isNil }                                  from 'lodash';
import { PushNotification }                       from '@frontend/core/lib/redux/ducks/notifications';
import { PurchaseError }                          from '@common/sdk/lib/@backend_nest/libs/common/src/purchases/ProductChecker.base.service';
import { CartContext }                            from '../Cart/CartContext';

const generateErrorMessage = (t: any, error: PurchaseError): string => {
    return t(error.reason, error.context);
}

export interface CartMenuExpiredProps {

}

export const CartMenuExpired: React.FC<CartMenuExpiredProps> = (props: CartMenuExpiredProps): JSX.Element => {

    const [t] = useTranslation('cart');
    const cart = useContext(CartContext);
    const [uuid] = useState(v4());
    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [capturedTimesstamp, setTimestamp] = useState(null);
    const dispatch = useDispatch();

    const setProductsLazyRequest = useLazyRequest<PurchasesSetProductsResponseDto>('purchases.setProducts', uuid);

    useEffect(() => {
        if (setProductsLazyRequest.response.called) {
            if (setProductsLazyRequest.response.error) {
                setTimestamp(null);
            } else if (setProductsLazyRequest.response.data) {

                const data = setProductsLazyRequest.response.data;
                if (data.errors.filter((elem): boolean => !isNil(elem)).length > 0) {
                    const errors = data.errors.filter((elem): boolean => !isNil(elem))
                    for (const error of errors) {
                        dispatch(PushNotification(generateErrorMessage(t, error), 'error'))
                    }
                    setTimestamp(null);
                } else {
                    cart.force();
                }

            }
        }
    }, [setProductsLazyRequest.response.data, setProductsLazyRequest.response.error, setProductsLazyRequest.response.called]);

    const onClear = () => {
        setProductsLazyRequest.lazyRequest([
            token,
            {
                products: []
            },
            v4()
        ], {
            force: true
        });
        setTimestamp(cart.last_update);
    }

    const loading = (capturedTimesstamp !== null && capturedTimesstamp === cart.last_update);

    return <div
        style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
        }}
    >
        <p>{t('expiration_notice')}</p>
        <Button
            style={{
                width: '80%'
            }}
            loadingState={loading}
            title={t('clear_cart')}
            variant={'danger'}
            onClick={onClear}
        />
    </div>
}
