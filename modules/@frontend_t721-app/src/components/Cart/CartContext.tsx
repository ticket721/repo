import React, { PropsWithChildren, useContext, useState } from 'react';
import { PurchaseEntity }                                 from '@common/sdk/lib/@backend_nest/libs/common/src/purchases/entities/Purchase.entity';
import { v4 }                                             from 'uuid';
import { useRequest }                                     from '@frontend/core/lib/hooks/useRequest';
import { useDeepEffect }                                  from '@frontend/core/lib/hooks/useDeepEffect';
import { PurchasesFetchResponseDto }                      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/purchases/dto/PurchasesFetchResponse.dto';
import { PurchaseError }                                  from '@common/sdk/lib/@backend_nest/libs/common/src/purchases/ProductChecker.base.service';
import { eq, isNil }                                      from 'lodash';
import { UserContext }                                    from '@frontend/core/lib/utils/UserContext';

export interface CartState {
    cart: PurchaseEntity;
    errors: PurchaseError[];
    last_update: Date;
    open: boolean;
    openMenu: () => void;
    closeMenu: () => void;
    force: () => void;
}

export const CartContext = React.createContext<CartState>({
    cart: null,
    last_update: new Date(),
    errors: null,
    open: false,
    openMenu: () => null,
    closeMenu: () => null,
    force: () => null
});

export interface CartContextManagerProps {
    token: string;
}

const LoggedInCartContextManager: React.FC<PropsWithChildren<CartContextManagerProps>> =
    (props: PropsWithChildren<CartContextManagerProps>): JSX.Element => {

        const [uuid] = useState(v4());
        const [lastUpdate, setLastUpdate] = useState(new Date());
        const [lastResp, setLastResp] = useState<PurchaseEntity>(null);
        const [lastErrors, setLastErrors] = useState<PurchaseError[]>(null);
        const [isOpen, setOpen] = useState<boolean>(false);

        const purchaseFetch = useRequest<PurchasesFetchResponseDto>({
            method: 'purchases.fetch',
            args: [props.token],
            refreshRate: 10,
        }, `CartContext@${uuid}`);

        useDeepEffect(() => {
            if (!isNil(purchaseFetch.response.data)
                && (!eq(purchaseFetch.response.data.cart, lastResp)
                    || !eq(purchaseFetch.response.data.errors, lastErrors))) {
                setLastResp(purchaseFetch.response.data.cart);
                setLastErrors(purchaseFetch.response.data.errors);
                setLastUpdate(new Date());
            }
        }, [purchaseFetch.response.data]);

        useDeepEffect(() => {
            if (lastResp && lastResp.products.length === 0 && isOpen) {
                setOpen(false);
            }
        }, [lastResp]);

        return <CartContext.Provider value={{
            cart: lastResp,
            errors: lastErrors,
            last_update: lastUpdate,
            open: isOpen,
            openMenu: () => {
                setOpen(true)
            },
            closeMenu: () => setOpen(false),
            force: purchaseFetch.force
        }}>
            {props.children}
        </CartContext.Provider>;
    }

const LoggedOutCartContextManager: React.FC<PropsWithChildren<any>> = (props: PropsWithChildren<any>): JSX.Element => {
    return <>
        {props.children}
    </>;
}

export const CartContextManager: React.FC<PropsWithChildren<CartContextManagerProps>> =
    (props: PropsWithChildren<CartContextManagerProps>): JSX.Element => {

        const user = useContext(UserContext);

        if (props.token && !isNil(user)) {
            return <LoggedInCartContextManager token={props.token}>
                {props.children}
            </LoggedInCartContextManager>
        } else {
            return <LoggedOutCartContextManager>
                {props.children}
            </LoggedOutCartContextManager>
        }
    };
