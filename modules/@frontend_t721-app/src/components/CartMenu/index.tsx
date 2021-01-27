import './locales';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import styled                                              from 'styled-components';
import { motion }                                          from 'framer-motion';
import { useWindowDimensions }                             from '@frontend/core/lib/hooks/useWindowDimensions';
import { CartContext }                                     from '../Cart/CartContext';
import { CartMenuPreview }                                 from './CartMenuPreview';
import { UserContext }                                     from '@frontend/core/lib/contexts/UserContext';
import { ValidateEmailComponent }                          from '@frontend/core/lib/components/ValidateEmail';
import { Button, DoubleButtonCta }                         from '@frontend/flib-react/lib/components';
import { isNil }                                           from 'lodash';
import { useDispatch }                                     from 'react-redux';
import { useToken }                                        from '@frontend/core/lib/hooks/useToken';
import { v4 }                                              from 'uuid';
import { useLazyRequest }                                  from '@frontend/core/lib/hooks/useLazyRequest';
import { PushNotification }                                from '@frontend/core/lib/redux/ducks/notifications';
import { PurchasesSetProductsResponseDto }                 from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/purchases/dto/PurchasesSetProductsResponse.dto';
import { PurchasesCheckoutResponseDto }                            from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/purchases/dto/PurchasesCheckoutResponse.dto';
import { PurchaseError }                                           from '@common/sdk/lib/@backend_nest/libs/common/src/purchases/ProductChecker.base.service';
import { useTranslation }                                          from 'react-i18next';
import { CartMenuCheckout }                                        from './CartMenuCheckout';
import { CartMenuExpired }                                         from './CartMenuExpired';
import Countdown                                                   from 'react-countdown';
import { getEnv }                                                  from '@frontend/core/lib/utils/getEnv';
import MediaQuery, { useMediaQuery }                               from 'react-responsive';
import { usePlatform }                                             from '@capacitor-community/react-hooks/platform';
import { useKeyboardState }                                        from '@frontend/core/lib/hooks/useKeyboardState';
import { HapticsImpactStyle, HapticsNotificationType, useHaptics } from '@frontend/core/lib/hooks/useHaptics';
import { event }                                                   from '@frontend/core/lib/tracking/registerEvent';
import { injectBlur }                                              from '@frontend/flib-react/lib/utils/blur';
// tslint:disable-next-line:no-var-requires
const SAI = require('safe-area-insets');

const Shadow = styled(motion.div)`
    position: fixed;
    background-color: #000000;
    opacity: 0;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 99999;
    overflow-x: hidden;
    overflow-y: hidden;
    transition: opacity 300ms;
`;

interface MenuContainerProps {
    width: number;
    left: number;
}

const MenuContainer = styled(motion.div) <MenuContainerProps>`
    position: fixed;
    width: ${props => props.width}px;
    padding-bottom: env(safe-area-inset-bottom);
    padding-bottom: constant(safe-area-inset-bottom);
    left: ${props => props.left}px;
    bottom: -100vh;
    z-index: 100000;

    @media screen and (min-width: 900px) {
        border-radius: 12px;
    }

    ${injectBlur('rgba(33, 29, 45, 0.2)', 'rgba(33, 29, 45, 1)')};
`;

const MenuContainerHeaderContainer = styled.div`
    width: 100%;
    height: 50px;
    border-bottom: 2px solid ${props => props.theme.componentColor};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    background-color: #ffffff05;
    align-items: center;
    padding-left: ${props => props.theme.regularSpacing};
    padding-right: ${props => props.theme.regularSpacing};
`;

const MenuContainerHeaderTitle = styled.p`
    font-weight: 600;
    font-size: 20px;
    margin: 0;
`;

const MenuContainerHeaderClose = styled.p`
    font-weight: 400;
    font-size: 15px;
    color: ${props => props.theme.errorColor.hex};
    margin: 0;
    cursor: pointer;
`;

const TimerText = styled.span`
    font-family: "Roboto Mono", monospace;
    margin: 0;
    font-weight: 300;
    font-size: 15px;
    opacity: 0.5;
`

const Actions = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: -75px ${props => props.theme.regularSpacing} 0;
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

const twoDigits = (num: number) => {
    if (num < 10) {
        return `0${num}`;
    } else {
        return `${num}`;
    }
}

const renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
        return null;
    } else {
        return <TimerText>{twoDigits(minutes)}:{twoDigits(seconds)}</TimerText>;
    }
};

const generateErrorMessage = (t: any, error: PurchaseError): string => {
    return t(error.reason, error.context);
}

const computeMenuHeight = (window, isKeyboardOpen, keyboardHeight, platform) => {

    if (isKeyboardOpen) {
        if (platform === 'android') {
            return window.height - SAI.top;
        }
        return window.height - keyboardHeight - SAI.top;
    }

    return (Math.floor(window.height * 0.7) < 500 ? window.height : Math.floor(window.height * 0.7)) + SAI.bottom - SAI.top;
}

const computeModalMenuHeight = (window, isKeyboardOpen, keyboardHeight, platform) => {

    if (isKeyboardOpen) {
        if (platform === 'android') {
            return window.height - SAI.top - SAI.bottom;
        }
        return window.height - keyboardHeight - SAI.top;
    }

    return 600;

}

const getMenuBottom = (cart, isSmallScreen, keyboard, window, platform, menuHeight): number => {
    if (cart.open) {

        return !isSmallScreen ?
            (!keyboard.isOpen ? (
                (window.height - 600) / 2
            ) : 0)
            : 0
    }

    return - (window.height * 2) - menuHeight;
}

export const CartMenu: React.FC = (): JSX.Element => {

    const [t] = useTranslation('cart');
    const window = useWindowDimensions();
    const cart = useContext(CartContext);
    const user = useContext(UserContext);
    const isSmallScreen = useMediaQuery({ maxWidth: 900 });
    const platform = usePlatform();
    const keyboard = useKeyboardState();
    const menuHeight = useMemo(
        () => isSmallScreen
            ? computeMenuHeight(window, keyboard.isOpen, keyboard.keyboardHeight, platform.platform)
            : computeModalMenuHeight(window, keyboard.isOpen, keyboard.keyboardHeight, platform.platform),
        [window, isSmallScreen, keyboard, platform.platform]
    );
    const token = useToken();
    const [uuid] = useState(v4());
    const clearCartLazyRequest = useLazyRequest<PurchasesSetProductsResponseDto>('purchases.setProducts', uuid);
    const checkoutLazyRequest = useLazyRequest<PurchasesCheckoutResponseDto>('purchases.checkout', uuid);
    const [clearCapturedTimesstamp, setClearTimestamp] = useState(null);
    const [checkoutCapturedTimesstamp, setCheckoutTimestamp] = useState(null);
    const dispatch = useDispatch();
    const [childrenLoading, setChildrenLoading] = useState(false);
    const disabled = isNil(cart.cart) || cart.errors.filter((err) => !isNil(err)).length > 0;
    const [ctaOpen, setCtaOpen] = useState(false);
    const underCountdown = useMemo(
        () => cart.cart
            && cart.cart.checked_out_at
            && cart.cart.payment
            && cart.cart.payment.status === 'waiting',
        [cart]
    );
    const haptics = useHaptics();

    const onClearCart = () => {

        haptics.impact({
            style: HapticsImpactStyle.Light
        });

        setClearTimestamp(cart.last_update);
        clearCartLazyRequest.lazyRequest([
            token,
            {
                products: []
            },
            v4()
        ], {
            force: true
        });

    }

    const onCheckout = () => {

        setCheckoutTimestamp(cart.last_update);
        checkoutLazyRequest.lazyRequest([
            token,
            {
                [cart.cart.payment_interface || 'none']: null
            },
            v4()
        ])

    }

    useEffect(() => {

            if (cart.open) {
                const iid = setTimeout(() => {
                    setCtaOpen(true)
                }, 1000);
                return () => {
                    clearInterval(iid);
                }
            } else {
                setCtaOpen(false)
            }
        },
        // eslint-disable-next-line
        [cart.open]);

    useEffect(() => {
            if (checkoutLazyRequest.response.called) {
                if (checkoutLazyRequest.response.error) {
                    haptics.notification({
                        type: HapticsNotificationType.ERROR
                    });
                    setCheckoutTimestamp(null);
                } else if (checkoutLazyRequest.response.data) {

                    const data = checkoutLazyRequest.response.data;

                    if (
                        (data.product_errors && data.product_errors.filter((elem): boolean => !isNil(elem)).length > 0)
                        || data.payment_error
                    ) {
                        haptics.notification({
                            type: HapticsNotificationType.ERROR
                        });
                        if (data.product_errors) {
                            const errors = data.product_errors.filter((elem): boolean => !isNil(elem))
                            for (const error of errors) {
                                dispatch(PushNotification(generateErrorMessage(t, error), 'error'))
                            }
                        }
                        if (data.payment_error) {
                            dispatch(PushNotification(generateErrorMessage(t, data.payment_error), 'error'))
                        }
                        setCheckoutTimestamp(null);
                    } else {
                        haptics.notification({
                            type: HapticsNotificationType.SUCCESS
                        });
                        event(
                            'Purchase',
                            'Cart checkout',
                            'User proceeds to payment'
                        );
                        cart.force(parseInt(getEnv().REACT_APP_ERROR_THRESHOLD, 10));
                    }


                }
            }
        },
        // eslint-disable-next-line
        [checkoutLazyRequest.response.data, checkoutLazyRequest.response.error, checkoutLazyRequest.response.called]);

    useEffect(() => {
            if (clearCartLazyRequest.response.called) {
                if (clearCartLazyRequest.response.error) {
                    setClearTimestamp(null);
                } else if (clearCartLazyRequest.response.data) {

                    const data = clearCartLazyRequest.response.data;
                    if (data.errors.filter((elem): boolean => !isNil(elem)).length > 0) {
                        const errors = data.errors.filter((elem): boolean => !isNil(elem))
                        for (const error of errors) {
                            dispatch(PushNotification(generateErrorMessage(t, error), 'error'))
                        }
                        setClearTimestamp(null);
                    } else {
                        cart.force(parseInt(getEnv().REACT_APP_ERROR_THRESHOLD, 10));
                    }

                }
            }
        },
        // eslint-disable-next-line
        [clearCartLazyRequest.response.data, clearCartLazyRequest.response.error, clearCartLazyRequest.response.called]);

    const loading =
        (clearCapturedTimesstamp !== null && clearCapturedTimesstamp === cart.last_update)
        || (checkoutCapturedTimesstamp !== null && checkoutCapturedTimesstamp === cart.last_update)
        || childrenLoading;

    const ctaVisible = !isNil(cart.cart) && !isNil(user) && cart.cart.products.length > 0 && ctaOpen;

    const expired = useMemo(() => {
        if (cart.cart && cart.cart.products.length > 0) {
            const expiryErrors = cart.errors.filter((err) => err && err.reason === 'cart_expired');
            return (expiryErrors.length === cart.cart.products.length);
        }
        return false;
    }, [cart.cart, cart.errors])

    const isFree = cart.cart ? isNil(cart.cart.price) || cart.cart.price === 0 : false;

    return <>
        <Shadow
            onClick={cart.closeMenu}
            variants={{
                visible: {
                    display: 'block',
                    opacity: 0.75,
                    transition: {
                        duration: 0.3,
                    },
                },
                hidden: {
                    display: 'none',
                    opacity: 0,
                    transition: {
                        duration: 0.3,
                        display: {
                            delay: 0.3,
                            duration: 0,
                        },
                    },
                },
            }}
            initial={'hidden'}
            animate={cart.open ? 'visible' : 'hidden'}
        />
        <MenuContainer
            width={isSmallScreen || keyboard.isOpen ? window.width : 700}
            left={isSmallScreen  || keyboard.isOpen ? 0 : (window.width - 700) / 2}
            transition={{
                duration: 0.75,
            }}
            animate={{
                bottom: getMenuBottom(cart, isSmallScreen, keyboard, window, platform.platform, menuHeight),
                height: menuHeight + (platform.platform === 'ios' ? keyboard.keyboardHeight : 0)
            }}
        >
            <MenuContainerHeaderContainer>
                <MenuContainerHeaderTitle>{t('cart')}</MenuContainerHeaderTitle>
                {underCountdown ? <Countdown
                    onComplete={cart.force}
                    renderer={renderer}
                    date={new Date(cart.cart.checked_out_at).getTime() + 15 * 60 * 1000}
                /> : null}
                <MenuContainerHeaderClose
                    onClick={() => {
                        haptics.impact({
                            style: HapticsImpactStyle.Light
                        });
                        cart.closeMenu()
                    }}
                >{t('close')}</MenuContainerHeaderClose>
            </MenuContainerHeaderContainer>
            {
                cart.open

                    ? (user && user.valid

                    ?
                    expired
                        ?
                        <CartMenuExpired />

                        :
                        (

                            cart.cart && cart.cart.payment

                                ?
                                <>
                                    <CartMenuCheckout
                                        height={menuHeight - 50}
                                    />
                                </>
                                :
                                <>
                                    <CartMenuPreview
                                        height={menuHeight - 50}
                                        setChildrenLoading={setChildrenLoading}
                                    />
                                    {
                                        cart.cart && cart.cart.products.length > 0

                                            ?
                                            <>
                                                <MediaQuery maxWidth={900}>
                                                    <DoubleButtonCta
                                                        solid={true}
                                                        show={ctaVisible}
                                                        loading={loading}
                                                        variant={disabled ? 'disabled' : 'custom'}
                                                        ctaLabel={isFree ? t('checkout_free') : t('checkout')}
                                                        secondaryLabel={t('empty')}
                                                        onClick={onCheckout}
                                                        onSecondaryClick={onClearCart}
                                                    />
                                                </MediaQuery>
                                                <MediaQuery minWidth={901}>
                                                    <Actions>
                                                        <TextButton onClick={onClearCart}>{t('empty')}</TextButton>
                                                        <ButtonWrapper>
                                                            <Button
                                                                loadingState={loading}
                                                                title={isFree ? t('checkout_free') : t('checkout')}
                                                                variant={loading ? 'disabled' : disabled ? 'disabled' : 'primary'}
                                                                onClick={loading ? undefined : onCheckout}
                                                            />
                                                        </ButtonWrapper>
                                                    </Actions>
                                                </MediaQuery>
                                            </>

                                            :
                                            null
                                    }
                                </>
                        )

                    :
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 20,
                        }}
                    >
                        <ValidateEmailComponent/>
                    </div>)

                    : null
            }
        </MenuContainer>
    </>;

};
