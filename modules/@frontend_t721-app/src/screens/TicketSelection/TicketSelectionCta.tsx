import { CategoryEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import React, { useContext, useEffect, useState } from 'react';
import { FullButtonCta } from '@frontend/flib-react/lib/components';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AddTicket, CartState } from '../../redux/ducks/cart';
import { useHistory } from 'react-router';
import { T721AppState } from '../../redux';
import { CartContext } from '../../components/Cart/CartContext';
import { isNil } from 'lodash';
import { useLazyRequest } from '@frontend/core/lib/hooks/useLazyRequest';
import { v4 } from 'uuid';
import { PurchasesSetProductsResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/purchases/dto/PurchasesSetProductsResponse.dto';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';
import { PurchaseError } from '@common/sdk/lib/@backend_nest/libs/common/src/purchases/ProductChecker.base.service';
import { Product } from '@common/sdk/lib/@backend_nest/libs/common/src/purchases/entities/Purchase.entity';

export interface TicketSelectionCtaProps {
    category: CategoryEntity;
    gradients: string[];
    clearSelection: () => void;
}

const generateErrorMessage = (t: any, error: PurchaseError): string => {
    console.log(error);
    return t(error.reason, error.context);
}

export const TicketSelectionCta: React.FC<TicketSelectionCtaProps> = (props: TicketSelectionCtaProps): JSX.Element => {

    const [t] = useTranslation('event_ticket_list');
    const dispatch = useDispatch();
    const history = useHistory();
    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [uuid] = useState(v4());
    const addToCartLazyRequest = useLazyRequest<PurchasesSetProductsResponseDto>('purchases.setProducts', `TicketSelectionCta@${uuid}`);
    const cart = useContext(CartContext);
    const [capturedTimesstamp, setTimestamp] = useState(null);

    const disabled = isNil(cart.cart);

    const onAddToCart = () => {
        if (cart.cart) {

            const products = cart.cart.products.map((product) => ({
                type: product.type,
                id: product.id,
                quantity: product.quantity
            }))

            const searchIndex = products.findIndex((product) => product.id === props.category.id);

            if (searchIndex !== -1) {
                products[searchIndex].quantity += 1;
            } else {
                products.push({
                    id: props.category.id,
                    type: 'category',
                    quantity: 1
                });
            }

            setTimestamp(cart.last_update);
            addToCartLazyRequest.lazyRequest([
                token,
                {
                    products
                }
            ], {
                force: true
            });

            console.log(products);
        }
    }

    useEffect(() => {
        if (addToCartLazyRequest.response.called) {
            if (addToCartLazyRequest.response.error) {
                setTimestamp(null);
            } else if (addToCartLazyRequest.response.data) {

                const data = addToCartLazyRequest.response.data;
                if (data.errors.filter((elem): boolean => !isNil(elem)).length > 0) {
                    const errors = data.errors.filter((elem): boolean => !isNil(elem))
                    for (const error of errors) {
                        dispatch(PushNotification(generateErrorMessage(t, error), 'error'))
                    }
                    setTimestamp(null);
                    props.clearSelection();
                } else {
                    cart.force();
                    props.clearSelection();
                }

            }
        }
    }, [addToCartLazyRequest.response.data, addToCartLazyRequest.response.error, addToCartLazyRequest.response.called]);

    const loading = capturedTimesstamp !== null && capturedTimesstamp === cart.last_update;

    return <FullButtonCta
        loading={loading}
        gradients={props.gradients}
        ctaLabel={t('checkout')}
        variant={disabled ? 'disabled' : 'custom'}
        onClick={onAddToCart}
        show={props.category !== null}
    />;

};
