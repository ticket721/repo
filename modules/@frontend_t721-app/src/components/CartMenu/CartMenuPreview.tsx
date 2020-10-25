import React, { useContext } from "react"
import { CartContext } from '../Cart/CartContext';
import { Product } from '@common/sdk/lib/@backend_nest/libs/common/src/purchases/entities/Purchase.entity';

interface CartMenuProductDisplay {
    product: Product;
}

const CartMenuProductPreview: React.FC<CartMenuProductDisplay> = (props: CartMenuProductDisplay): JSX.Element => {
    switch (props.product.type) {
        case 'category': {
            return <p>{props.product.id}</p>
        }
        default: {
            return null
        }
    }
}

interface CartMenuPreview {

}

export const CartMenuPreview: React.FC<CartMenuPreview> = (props: CartMenuPreview): JSX.Element => {
    const cart = useContext(CartContext);

    if (!cart.cart) {
        return null
    } else {
        return <>
            {cart.cart.products.map((product: Product, idx: number) => <CartMenuProductPreview product={product} key={idx} />)}
        </>
    }

}