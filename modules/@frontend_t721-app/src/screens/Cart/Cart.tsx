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
import styled                       from 'styled-components';
import { useTranslation }           from 'react-i18next';

const CartContainer = styled.div`
`;

const Cart: React.FC = () => {

    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const [uuid] = useState(v4());
    const [t] = useTranslation(['cart', 'common']);

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
                $sort: [{
                    $field_name: 'created_at',
                    $order: 'asc'
                }]
            },
        ],
        refreshRate: 3,
    }, `Cart@${uuid}`);

    if (cartResponse.response.loading) {
        return <FullPageLoading/>;
    }

    if (cartResponse.response.error) {
        return <Error message={t('error_cannot_fetch_cart')} retryLabel={t('common:retrying_in')} onRefresh={cartResponse.force}/>;
    }

    if (cartResponse.response.data.actionsets.length === 0) {
        return <CartCreation/>;
    }

    const cart = cartResponse.response.data.actionsets[0];

    return (
        <CartContainer>
            <CartManager cart={cart}/>
        </CartContainer>
    );
};

export default Cart;
