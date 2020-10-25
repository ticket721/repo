import React, { useContext } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useWindowDimensions } from '@frontend/core/lib/hooks/useWindowDimensions';
import { CartContext } from '../Cart/CartContext';
import { CartMenuPreview } from './CartMenuPreview';

interface ShadowProps {
    width: number;
    height: number;
}

const Shadow = styled(motion.div) <ShadowProps>`
    position: fixed;
    background-color: #000000;
    width: ${props => props.width}px;
    height: ${props => props.height}px;
    top: 0;
    left: ${props => -props.width}px;
    z-index: 99999;
    overflow-x: hidden;
    overflow-y: hidden;
`;

interface MenuContainerProps {
    width: number;
    height: number;
}

const MenuContainer = styled(motion.div) <MenuContainerProps>`
    position: fixed;
    width: ${props => props.width}px;
    height: ${props => props.height}px;

    background-color: rgba(33, 29, 45, 1);
    @supports ((-webkit-backdrop-filter: blur(2em)) or (backdrop-filter: blur(2em))) {
        background-color: rgba(33, 29, 45, 0.6);
        backdrop-filter: blur(8px);
    }

    top: ${props => props.height}px;
    left: 0;
    z-index: 100000;
`

const MenuContainerHeaderContainer = styled.div`
    width: 100%;
    height: 50px;
    border-bottom: 1px solid ${props => props.theme.componentColor};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-left: ${props => props.theme.regularSpacing};
    padding-right: ${props => props.theme.regularSpacing};
`

const MenuContainerHeaderTitle = styled.p`
    font-weight: 600;
    font-size: 20px;
    margin: 0;
`;

const MenuCOntainerHeaderClose = styled.p`
    font-weight: 400;
    font-size: 15px;
    color: ${props => props.theme.errorColor.hex};
    margin: 0;
`;

export const CartMenu: React.FC = (): JSX.Element => {

    const window = useWindowDimensions();
    const cart = useContext(CartContext);
    const menuHeight = Math.floor(window.height * 0.7) < 500 ? 500 : Math.floor(window.height * 0.7);

    return <>
        <Shadow
            width={window.width}
            height={window.height}
            variants={{
                visible: {
                    opacity: 0.75,
                    left: 0,
                    transition: {
                        duration: 1,
                        left: {
                            duration: 0
                        }
                    }
                },
                hidden: {
                    opacity: 0,
                    left: - window.width,
                    transition: {
                        duration: 1,
                        left: {
                            delay: 1,
                            duration: 0
                        }
                    }
                }
            }}
            initial={'hidden'}
            animate={cart.open ? 'visible' : 'hidden'}
        />
        <MenuContainer
            width={window.width}
            height={menuHeight}
            transition={{
                duration: 1
            }}
            variants={{
                visible: {
                    top: window.height - menuHeight,
                },
                hidden: {
                    top: window.height * 2
                }
            }}
            initial={'hidden'}
            animate={cart.open ? 'visible' : 'hidden'}
        >
            <MenuContainerHeaderContainer>
                <MenuContainerHeaderTitle>Cart</MenuContainerHeaderTitle>
                <MenuCOntainerHeaderClose
                    onClick={cart.closeMenu}
                >Close</MenuCOntainerHeaderClose>
            </MenuContainerHeaderContainer>
            <CartMenuPreview/>
        </MenuContainer>
    </>

}