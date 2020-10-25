import React, { useContext, useMemo, useState, useEffect } from 'react';
import { CartContext } from '../Cart/CartContext';
import { motion, useAnimation } from 'framer-motion'
import { useWindowDimensions } from '@frontend/core/lib/hooks/useWindowDimensions';
import styled, { useTheme } from 'styled-components';
import { Theme } from '@frontend/flib-react/lib/config/theme';
import { Icon } from '@frontend/flib-react/lib/components';

interface ContainerProps {
    spacing: number;
    navbar: number;
    width: number;
    height: number;
}

const Container = styled(motion.div) <ContainerProps>`
  right: ${props => props.spacing}px;
  bottom: ${props => props.spacing + props.navbar}px;
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
`

const CartIcon = styled(Icon)`
  
`

const Badge = styled(motion.div)`
    position: absolute;
    right: 0;
    top: 0;
    width: 25px;
    height: 25px;
    border-radius: 100%;
    background-color ${props => props.theme.primaryColor.hex};
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
`

export const CartButton: React.FC = (): JSX.Element => {
    const cart = useContext(CartContext);
    const controls = useAnimation()
    const window = useWindowDimensions();
    const [mouseState, setMouseState] = useState({ down: false, moved: false });
    const theme = useTheme() as Theme;
    const visible = useMemo(() => cart.cart ? cart.cart.products.length > 0 && !cart.open : false, [cart.last_update, cart.open]);
    const productCount = cart.cart?.products.length ? cart.cart.products
        .map((p) => p.quantity)
        .reduce((p1, p2) => p1 + p2) : 0;

    useEffect(() => {
        return () => {
            controls.start({
                scale: 1.5
            }).then(() => {
                controls.start({
                    scale: 1
                })
            })
        }
    }, [productCount]);

    const width = 65;
    const height = 65;
    const navbar = 80;
    const spacing = 8;

    const amplitudeX = window.width - width - spacing * 2;
    const amplitudeY = window.height - height - spacing * 2 - navbar;

    return <Container
        onMouseMove={() => {
            if (mouseState.down && !mouseState.moved) {
                setMouseState({
                    down: true,
                    moved: true
                })
            }
        }}
        onMouseDown={() => setMouseState({ down: true, moved: false })}
        onMouseUp={() => {
            console.log(mouseState);
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
                    moved: true
                })
            }
        }}
        onTouchStart={() => setMouseState({ down: true, moved: false })}
        onTouchEnd={() => {
            console.log(mouseState);
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
                        damping: 10
                    }
                }
            },
            hidden: {
                right: - (window.width + spacing),
                rotate: 45,
                transition: {
                    duration: 0.5,
                    rotate: {
                        type: 'spring',
                        stiffness: 500,
                        damping: 10
                    }
                }
            }
        }}
        drag
        dragConstraints={{
            top: - amplitudeY,
            left: - amplitudeX,
            right: 0,
            bottom: 0,
        }}
    >

        <CartIcon
            icon={'shopping-basket'}
            size={'30px'}
            color={'white'}
        />
        <Badge
            animate={controls}
        >
            <BadgeNumber>{productCount}</BadgeNumber>
        </Badge>

    </Container>
}
