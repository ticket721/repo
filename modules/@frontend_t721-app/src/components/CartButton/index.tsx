import React, { useContext, useEffect, useMemo } from 'react';
import { CartContext }                                     from '../Cart/CartContext';
import { motion, useAnimation }                            from 'framer-motion';
import { useWindowDimensions }                             from '@frontend/core/lib/hooks/useWindowDimensions';
import styled                                              from 'styled-components';
import { Icon }                                            from '@frontend/flib-react/lib/components';
import { PaymentError }                                    from '@backend/nest/libs/common/src/purchases/PaymentHandler.base.service';
import { isNil }                                           from 'lodash';
import { HapticsImpactStyle, useHaptics }                  from '@frontend/core/lib/hooks/useHaptics';

interface ContainerProps {
    spacing: number;
    navbar: number;
    width: number;
    height: number;
}

const Container = styled(motion.div)<ContainerProps>`
  right: ${props => props.spacing}px;
  bottom: calc(${props => props.spacing + props.navbar}px + env(safe-area-inset-bottom));
  bottom: calc(${props => props.spacing + props.navbar}px + constant(safe-area-inset-bottom));
  position: fixed;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border-radius: 100%;
  z-index: 99999;
  cursor: pointer;

  background-color: rgba(43, 39, 55, 1);
  @supports ((-webkit-backdrop-filter: blur(2em)) or (backdrop-filter: blur(2em))) {
    background-color: rgba(43, 39, 55, 0.6);
    backdrop-filter: blur(4px);
  }

  display: flex;
  justify-content: center;
  align-items: center;
`;

const CartIcon = styled(Icon)``;

interface BadgeProps {
    error: boolean;
}

const Badge = styled(motion.div)<BadgeProps>`
    position: absolute;
    right: 0;
    top: 0;
    width: 25px;
    height: 25px;
    border-radius: 100%;
    background-color ${props => props.error ? 'red' : props.theme.primaryColor.hex};
    display flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    margin: 0;
`;

const BadgeNumber = styled.span`
    margin: 0;
    line-height: 100%;
    font-size: 14px;
    font-weight: 700;
`;

const checkIfError = (errors: PaymentError[]): boolean => {
    if (isNil(errors)) {
        return false;
    }

    return errors.filter((err: PaymentError): boolean => !isNil(err)).length !== 0;
};

export const CartButton: React.FC = (): JSX.Element => {
    const cart = useContext(CartContext);
    const controls = useAnimation();
    const window = useWindowDimensions();
    const visible = useMemo(() => cart.cart ? cart.cart.products.length > 0 && !cart.open : false, [cart]);
    const productCount = useMemo(() => cart.cart?.products.length ? cart.cart.products
        .map((p) => p.quantity)
        .reduce((p1, p2) => p1 + p2) : 0,
    [cart]);

    useEffect(() => {
        return () => {
            controls.start({
                scale: 1.5,
            }).then(() => {
                controls.start({
                    scale: 1,
                });
            });
        };
    }, [productCount, controls]);

    const width = useMemo(() => window.width < 900 ? 65 : 80, [window.width]);
    const height = useMemo(() => window.width < 900 ? 65 : 80, [window.width]);
    const navbar = useMemo(() => window.width < 900 ? 70 : 0, [window.width]);
    const spacing = useMemo(() => window.width >= 900 ? 32 : 8, [window.width]);

    const haptics = useHaptics();

    const isError = checkIfError(cart.errors);

    return <Container
        onClick={() => {
            haptics.impact({
                style: HapticsImpactStyle.Medium
            });
            cart.openMenu();
        }}
        whileTap={{
            scale: 0.95
        }}
        spacing={spacing}
        navbar={navbar}
        width={width}
        height={height}
        initial={'hidden'}
        animate={visible ? 'visible' : 'hidden'}
        variants={{
            visible: {
                right: spacing,
                rotate: 0,
                transition: {
                    duration: 0.5,
                    rotate: {
                        type: 'spring',
                        stiffness: 500,
                        damping: 10,
                    },
                },
            },
            hidden: {
                right: -(window.width + spacing),
                rotate: 45,
                transition: {
                    duration: 0.5,
                    rotate: {
                        type: 'spring',
                        stiffness: 500,
                        damping: 10,
                    },
                },
            },
        }}
        drag
        dragMomentum={true}
        dragConstraints={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        }}
    >


        {
            !isError

                ?
                <>
                    <CartIcon
                        icon={'shopping-basket'}
                        size={window.width <= 900 ? '30px' : '38px'}
                        color={'white'}
                    />
                    <Badge
                        error={isError}
                        animate={controls}
                    >
                        <BadgeNumber>{productCount}</BadgeNumber>
                    </Badge>
                </>

                :
                <>
                    <CartIcon
                        icon={'shopping-basket'}
                        size={'30px'}
                        color={'red'}
                    />
                    <Badge
                        error={isError}
                        animate={controls}
                    >
                        <BadgeNumber>{'!'}</BadgeNumber>
                    </Badge>
                </>
        }


    </Container>;
};
