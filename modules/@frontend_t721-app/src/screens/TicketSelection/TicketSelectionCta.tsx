import { CategoryEntity }                                          from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import React, { useCallback, useContext, useEffect, useState }     from 'react';
import { FullButtonCta }                                           from '@frontend/flib-react/lib/components';
import { useTranslation }                                          from 'react-i18next';
import { useDispatch }                                             from 'react-redux';
import { useHistory, useLocation }                                 from 'react-router';
import { useToken }                                                from '@frontend/core/lib/hooks/useToken';
import { CartContext }                                             from '../../components/Cart/CartContext';
import { isNil }                                                   from 'lodash';
import { useLazyRequest }                                          from '@frontend/core/lib/hooks/useLazyRequest';
import { v4 }                                                      from 'uuid';
import { PurchasesSetProductsResponseDto }                         from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/purchases/dto/PurchasesSetProductsResponse.dto';
import { PushNotification }                                        from '@frontend/core/lib/redux/ducks/notifications';
import { PurchaseError }                                           from '@common/sdk/lib/@backend_nest/libs/common/src/purchases/ProductChecker.base.service';
import { UserContext }                                             from '@frontend/core/lib/utils/UserContext';
import { getEnv }                                                  from '@frontend/core/lib/utils/getEnv';
import { HapticsImpactStyle, HapticsNotificationType, useHaptics } from '@frontend/core/lib/utils/useHaptics';

export interface TicketSelectionCtaProps {
    category: CategoryEntity;
    gradients: string[];
    clearSelection: () => void;
}

const generateErrorMessage = (t: any, error: PurchaseError): string => {
    return t(error.reason, error.context);
}

export const TicketSelectionCta: React.FC<TicketSelectionCtaProps> = (props: TicketSelectionCtaProps): JSX.Element => {

    const [t] = useTranslation('event_ticket_list');
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();
    const token = useToken();
    const [uuid] = useState(v4());
    const addToCartLazyRequest = useLazyRequest<PurchasesSetProductsResponseDto>('purchases.setProducts', `TicketSelectionCta@${uuid}`);
    const cart = useContext(CartContext);
    const user = useContext(UserContext);
    const [capturedTimesstamp, setTimestamp] = useState(null);
    const haptics = useHaptics();

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
        }
    }

    const force = useCallback(cart.force, [cart]);

    useEffect(() => {
            if (addToCartLazyRequest.response.called) {
                if (addToCartLazyRequest.response.error) {
                    haptics.notification({
                        type: HapticsNotificationType.ERROR
                    });
                    setTimestamp(null);
                } else if (addToCartLazyRequest.response.data) {

                    const data = addToCartLazyRequest.response.data;
                    if (data.errors.filter((elem): boolean => !isNil(elem)).length > 0) {
                        haptics.notification({
                            type: HapticsNotificationType.ERROR
                        });
                        const errors = data.errors.filter((elem): boolean => !isNil(elem))
                        for (const error of errors) {
                            dispatch(PushNotification(generateErrorMessage(t, error), 'error'))
                        }
                        setTimestamp(null);
                        props.clearSelection();
                    } else {
                        haptics.notification({
                            type: HapticsNotificationType.SUCCESS
                        });
                        force(parseInt(getEnv().REACT_APP_ERROR_THRESHOLD, 10));
                        props.clearSelection();
                    }

                }
            }
        },
        // eslint-disable-next-line
        [addToCartLazyRequest.response.data, addToCartLazyRequest.response.error, addToCartLazyRequest.response.called]);

    const loading = capturedTimesstamp !== null && capturedTimesstamp === cart.last_update;

    if (user === null) {

        const redirectToLogin = () => {
            history.push('/login', {
                from: `${location.pathname}${location.search}`,
            })
        }

        return <FullButtonCta
            loading={loading}
            gradients={props.gradients}
            ctaLabel={t('login_or_register')}
            variant={'custom'}
            onClick={() => {
                haptics.impact({
                    style: HapticsImpactStyle.Light
                });
                redirectToLogin();
            }}
            show={props.category !== null}
        />;
    } else {
        return <FullButtonCta
            loading={loading}
            gradients={props.gradients}
            ctaLabel={t('checkout')}
            variant={disabled ? 'disabled' : 'custom'}
            onClick={() => {
                onAddToCart();
            }}
            show={props.category !== null}
        />;
    }


};
