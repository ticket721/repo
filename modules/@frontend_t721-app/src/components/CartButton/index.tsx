import React, { useContext, useMemo, useState, useEffect } from 'react';
import { CartContext }                                     from '../Cart/CartContext';
import { motion, useAnimation }                            from 'framer-motion';
import { useWindowDimensions }                             from '@frontend/core/lib/hooks/useWindowDimensions';
import styled                                              from 'styled-components';
import { Icon }                                            from '@frontend/flib-react/lib/components';
import { PaymentError }                                    from '@backend/nest/libs/common/src/purchases/PaymentHandler.base.service';
import { isNil }                                           from 'lodash';

interface ContainerProps {
    spacing: number;
    navbar: number;
    width: number;
    height: number;
}

const Container = styled(motion.div) <ContainerProps>`
  right: ${props => props.spacing}px;
  bottom: calc(${props => props.spacing + props.navbar}px + env(safe-area-inset-bottom));
  bottom: calc(${props => props.spacing + props.navbar}px + constant(safe-area-inset-bottom));
  position: fixed;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border-radius: 100%;
  z-index: 99999;

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
    const [mouseState, setMouseState] = useState({ down: false, moved: false });
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

    const width = useMemo(() => 65, []);
    const height = useMemo(() => 65, []);
    const navbar = useMemo(() => 80, []);
    const spacing = useMemo(() => 8, []);

    // const insets = useMemo(() => SAI.bottom + SAI.top, [SAI.bottom, SAI.top]);

    // const amplitudeX = useMemo(() => window.width - width - spacing * 2, [window.width, width, spacing]);
    // const amplitudeY = useMemo(() => window.height - height - spacing * 2 - navbar - insets, [window.height, height, navbar, insets]);

    const isError = checkIfError(cart.errors);

    return <Container
        onMouseMove={() => {
            if (mouseState.down && !mouseState.moved) {
                setMouseState({
                    down: true,
                    moved: true,
                });
            }
        }}
        onMouseDown={() => setMouseState({ down: true, moved: false })}
        onMouseUp={() => {
            let cb = false;
            if (!mouseState.moved) {
                cb = true;
            }

            setMouseState({ down: false, moved: false });

            if (cb) {
                cart.openMenu();
            }

        }}
        onTouchMove={() => {
            if (mouseState.down && !mouseState.moved) {
                setMouseState({
                    down: true,
                    moved: true,
                });
            }
        }}
        onTouchStart={() => setMouseState({ down: true, moved: false })}
        onTouchEnd={() => {
            let cb = false;
            if (!mouseState.moved) {
                cb = true;
            }

            setMouseState({ down: false, moved: false });

            if (cb) {
                cart.openMenu();
            }

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
            // top: -amplitudeY,
            // left: -amplitudeX,
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
                        size={'30px'}
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
