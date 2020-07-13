import React, { useState } from 'react';
import { useLazyRequest }             from '@frontend/core/lib/hooks/useLazyRequest';
import { useSelector }                from 'react-redux';
import { T721AppState }               from '../../redux';
import { v4 }                         from 'uuid';
import { FullPageLoading, Error }     from '@frontend/flib-react/lib/components';
import { useDeepEffect }              from '@frontend/core/lib/hooks/useDeepEffect';

export const CartCreation: React.FC = (): JSX.Element => {
    const {token} = useSelector((state: T721AppState) => ({token: state.auth.token?.value}));
    const [uuid] = useState(v4());

    const lazyCartCreation = useLazyRequest('actions.create', `CartCreation@${uuid}`);

    useDeepEffect(() => {
        if (!lazyCartCreation.response.called) {
            lazyCartCreation.lazyRequest([
                token,
                {
                    name: 'cart_create',
                    arguments: {}
                }
            ], {
                force: true
            })
        }
    }, [token, lazyCartCreation]);

    if (lazyCartCreation.response.error) {
        return <Error message={'Unable to create cart'}/>;
    }

    console.log('creating a new cart');

    return <FullPageLoading/>
};
