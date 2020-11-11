import React, { useContext } from 'react';
import { Navbar } from './Navbar';
import { CartContext } from '../Cart/CartContext';

interface T721NavbarProps {
    visible: boolean;
}

export const T721Navbar: React.FC<T721NavbarProps> = (props: T721NavbarProps): JSX.Element => {
    const cart = useContext(CartContext);

    return <Navbar visible={props.visible && !cart.open} />;
};
