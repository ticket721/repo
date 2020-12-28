import React, { PropsWithChildren, useContext, useEffect, useState } from 'react';
import { PurchaseEntity }                                            from '@common/sdk/lib/@backend_nest/libs/common/src/purchases/entities/Purchase.entity';
import { v4 }                                             from 'uuid';
import { useRequest }                                     from '@frontend/core/lib/hooks/useRequest';
import { useDeepEffect }                                  from '@frontend/core/lib/hooks/useDeepEffect';
import { PurchasesFetchResponseDto }                      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/purchases/dto/PurchasesFetchResponse.dto';
import { PurchaseError }                                  from '@common/sdk/lib/@backend_nest/libs/common/src/purchases/ProductChecker.base.service';
import { eq, isNil }                                      from 'lodash';
import { UserContext }                                    from '@frontend/core/lib/contexts/UserContext';
import { useHistory }                                     from 'react-router';
import { modalview }                                      from '@frontend/core/lib/tracking/modalview';
import { pageview }                                       from '@frontend/core/lib/tracking/pageview';

export interface CartState {
    cart: PurchaseEntity;
    errors: PurchaseError[];
    last_update: Date;
    open: boolean;
    openMenu: () => void;
    closeMenu: () => void;
    force: (score?: number) => void;
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

export interface LoggedInCartContextManagerProps {
    token: string;
    lastResp: PurchaseEntity;
    setLastResp: (lr: PurchaseEntity) => void;
    lastErrors: PurchaseError[];
    setLastErrors: (lr: PurchaseError[]) => void;
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    setForce: (cbobj: {cb: (() => void)}) => void;
    setLastUpdate: (lu: Date) => void;
}

const LoggedInCartContextManager: React.FC<PropsWithChildren<LoggedInCartContextManagerProps>> =
    (props: PropsWithChildren<LoggedInCartContextManagerProps>): JSX.Element => {

        const [uuid] = useState(v4());

        const purchaseFetch = useRequest<PurchasesFetchResponseDto>({
            method: 'purchases.fetch',
            args: [props.token],
            refreshRate: 10,
        }, `CartContext@${uuid}`);

        useDeepEffect(() => {
            if (!isNil(purchaseFetch.response.data)
                && (!eq(purchaseFetch.response.data.cart, props.lastResp)
                    || !eq(purchaseFetch.response.data.errors, props.lastErrors))) {
                props.setLastResp(purchaseFetch.response.data.cart);
                props.setLastErrors(purchaseFetch.response.data.errors);
                props.setLastUpdate(new Date());
            }
        },
            // eslint-disable-next-line
            [purchaseFetch.response.data]);

        useEffect(() => {
            props.setForce({
                cb: purchaseFetch.force
            })
        },
            // eslint-disable-next-line
            [purchaseFetch])

        useDeepEffect(() => {
            if (props.lastResp && props.lastResp.products.length === 0 && props.isOpen) {
                props.setOpen(false);
            }
        }, [props.lastResp]);

        return null;
    }

export interface LoggedOutCartContextManagerProps {
    token: string;
    lastResp: PurchaseEntity;
    setLastResp: (lr: PurchaseEntity) => void;
    lastErrors: PurchaseError[];
    setLastErrors: (lr: PurchaseError[]) => void;
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    setForce: (cbobj: {cb: (() => void)}) => void;
    setLastUpdate: (lu: Date) => void;
}

const LoggedOutCartContextManager: React.FC<LoggedOutCartContextManagerProps> = (props: LoggedOutCartContextManagerProps): JSX.Element => {

    useEffect(() => {
        props.setLastErrors(null);
        props.setLastUpdate(new Date());
        props.setOpen(false);
        props.setForce({cb: () => null});
        props.setLastResp(null);
    },
        // eslint-disable-next-line
        []);

    return null;
}

export interface CartContextManagerProps {
    token: string;
}

export const CartContextManager: React.FC<PropsWithChildren<CartContextManagerProps>> =
    (props: PropsWithChildren<CartContextManagerProps>): JSX.Element => {

        const user = useContext(UserContext);
        const [lastResp, setLastResp] = useState<PurchaseEntity>(null);
        const [lastErrors, setLastErrors] = useState<PurchaseError[]>(null);
        const [lastUpdate, setLastUpdate] = useState(new Date());
        const [isOpen, setOpen] = useState<boolean>(false);
        const [force, setForce] = useState<{cb: () => void}>({
            cb: () => null
        });
        const history = useHistory();

        return <>
            {
                props.token && !isNil(user)

                    ? <LoggedInCartContextManager
                        token={props.token}
                        lastResp={lastResp}
                        setLastResp={setLastResp}
                        lastErrors={lastErrors}
                        setLastErrors={setLastErrors}
                        isOpen={isOpen}
                        setOpen={setOpen}
                        setForce={setForce}
                        setLastUpdate={setLastUpdate}
                    />

                    : <LoggedOutCartContextManager
                        token={props.token}
                        lastResp={lastResp}
                        setLastResp={setLastResp}
                        lastErrors={lastErrors}
                        setLastErrors={setLastErrors}
                        isOpen={isOpen}
                        setOpen={setOpen}
                        setForce={setForce}
                        setLastUpdate={setLastUpdate}
                    />
            }
            <CartContext.Provider value={{
                cart: lastResp,
                errors: lastErrors,
                last_update: lastUpdate,
                open: isOpen,
                openMenu: () => {
                    setOpen(true)
                    modalview('/cart');
                },
                closeMenu: () => {
                    setOpen(false)
                    pageview(`${history.location.pathname}${history.location.search}`);
                },
                force: force.cb
            }}>

                {props.children}
            </CartContext.Provider>
        </>;
    };
