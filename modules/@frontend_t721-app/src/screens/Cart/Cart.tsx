import './locales';
import React, { useState }          from 'react';
import { useRequest }               from '@frontend/core/lib/hooks/useRequest';
import { ActionsSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/actionsets/dto/ActionsSearchResponse.dto';
import { useSelector }              from 'react-redux';
import { T721AppState }             from '../../redux';
import { v4 }                       from 'uuid';
import { FullPageLoading, Error }   from '@frontend/flib-react/lib/components';
import { CartCreation }             from './CartCreation';
import { CartManager }              from './CartManager';

const Cart: React.FC = () => {

    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [uuid] = useState(v4());

    const cartResponse = useRequest<ActionsSearchResponseDto>({
        method: 'actions.search',
        args: [
            token,
            {
                consumed: {
                    $eq: false,
                },
                name: {
                    $eq: '@cart/creation',
                },
            },
        ],
        refreshRate: 3,
    }, `Cart@${uuid}`);

    if (cartResponse.response.loading) {
        return <FullPageLoading/>;
    }

    if (cartResponse.response.error) {
        return <Error message={'Cannot recover cart'}/>;
    }

    if (cartResponse.response.data.actionsets.length === 0) {
        return <CartCreation/>;
    }

    const cart = cartResponse.response.data.actionsets[0];

    return (
        <CartManager cart={cart}/>
    );
};

export default Cart;
