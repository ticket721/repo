import { ActionSetEntity }              from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';
import React, { useCallback, useState } from 'react';
import { useSelector }                  from 'react-redux';
import { T721AppState }             from '../../redux';
import { v4 }                       from 'uuid';
import { useLazyRequest }           from '@frontend/core/lib/hooks/useLazyRequest';
import { ActionsUpdateResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/actionsets/dto/ActionsUpdateResponse.dto';
import { CartState }               from '../../redux/ducks/cart';
import { FullPageLoading, Error }  from '@frontend/flib-react/lib/components';
import { useDeepEffect }           from '@frontend/core/lib/hooks/useDeepEffect';
import { TicketMintingFormat }     from '@common/sdk/lib/@backend_nest/libs/common/src/utils/Cart.type';
import { CategoryEntity }          from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { InputPrice, Price }       from '@common/sdk/lib/@backend_nest/libs/common/src/currencies/Currencies.service';
import { SyncedCartSelectGroupId } from './SyncedCartSelectGroupId/SyncedCartSelectGroupId';
import { SyncedCartRemoveTickets } from './SyncedCartRemoveTickets/SyncedCartRemoveTickets';
import { SyncedCartNotifyErrors }  from './SyncedCartNotifyErrors/SyncedCartNotifyErrors';
import { SyncedCart }              from './SyncedCart/SyncedCart';
import { SyncedCartEmpty }         from './SyncedCartEmpty/SyncedCartEmpty';
import { StripeCheckout }          from './StripeCheckout/StripeCheckout';
import { useTranslation }          from 'react-i18next';

export interface CartManagerProps {
    cart: ActionSetEntity;
}

// this will determine if actionset and local cart are in sync
const isLocalTicketsInSyncWithActionSetTicket = (cart: CartState, actionSetData: any): boolean => {
    if (!actionSetData.tickets) {
        return false;
    }

    if (cart.tickets.length !== actionSetData.tickets.length) {
        return false;
    }

    for (let idx = 0; idx < cart.tickets.length; ++idx) {
        if (cart.tickets[idx].id.toLowerCase() !== actionSetData.tickets[idx].categoryId.toLowerCase()) {
            return false;
        }
    }

    return true;
};

export interface CartAddPendingTIcketsProps {
    cart: ActionSetEntity;
}

const getCategoryPrice = (category: CategoryEntity): InputPrice => {
    const t721TokenIndex = category.prices.findIndex((price: Price): boolean => price.currency === 'T721Token');

    if (t721TokenIndex !== -1) {
        return {
            currency: 'Fiat',
            price: category.prices[t721TokenIndex].value,
        };
    }

    return undefined;
};

const convertPendingToMintingFormat = (cart: CartState): TicketMintingFormat[] => {

    const ret: TicketMintingFormat[] = [];

    for (const ticketCategory of cart.tickets) {

        ret.push({
            categoryId: ticketCategory.id,
            price: getCategoryPrice(ticketCategory),
        });

    }

    return ret;
};

export const CartAddPendingTickets: React.FC<CartAddPendingTIcketsProps> = (props: CartAddPendingTIcketsProps): JSX.Element => {

    const [uuid] = useState(v4());
    const { token, cart } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value, cart: state.cart }));
    const ticketsSelection = useLazyRequest<ActionsUpdateResponseDto>('cart.ticketSelections', `CartManager@${uuid}`);
    const [t] = useTranslation(['cart', 'common']);

    const lazyReq = useCallback(() => {
        const tickets = convertPendingToMintingFormat(cart);

        ticketsSelection.lazyRequest([
            token,
            props.cart.id,
            {
                tickets,
            },
        ], {
            force: true
        });
    }, [ticketsSelection, cart, token, props.cart]);

    useDeepEffect(() => {

        if (!ticketsSelection.response.called) {
            lazyReq();
        }

    }, [ticketsSelection, lazyReq]);

    if (ticketsSelection.response.error) {
        return <Error message={t('error_cannot_update_cart')} retryLabel={t('common:retrying_in')} onRefresh={lazyReq}/>;
    }

    return <FullPageLoading/>;
};

export interface SyncedCartManagerProps {
    remoteCart: ActionSetEntity;
    cart: CartState;
}

export const SyncedCartManager: React.FC<SyncedCartManagerProps> = (props: SyncedCartManagerProps): JSX.Element => {
    const ticketSelectionsAction = props.remoteCart.actions[0];
    const [t] = useTranslation(['cart', 'common']);

    if (ticketSelectionsAction.error) {
        const errorData = JSON.parse(ticketSelectionsAction.error);
        switch (errorData.error) {
            case 'cart_too_big': {
                return <SyncedCartRemoveTickets cart={props.remoteCart}/>;
            }
            case 'cannot_purchase_multiple_group_id': {
                return <SyncedCartSelectGroupId cart={props.remoteCart}/>;
            }
            case 'cannot_purchase_tickets': {
                return <SyncedCartNotifyErrors errors={errorData.details}/>;
            }
            case 'no_tickets_in_cart': {
                return <SyncedCartEmpty/>
            }
            default: {
                return <Error message={t('error_cannot_fetch_cart')}/>;
            }
        }
    }

    return <SyncedCart cart={props.cart} remoteCart={props.remoteCart}/>
};

export const CartManager: React.FC<CartManagerProps> = (props: CartManagerProps): JSX.Element => {

    const { cart } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value, cart: state.cart }));

    const ticketSelectionsAction = props.cart.actions[0];
    const ticketSelectionsActionData = JSON.parse(ticketSelectionsAction.data);

    if (!isLocalTicketsInSyncWithActionSetTicket(cart, ticketSelectionsActionData)) {
        return <CartAddPendingTickets cart={props.cart} />;
    }

    if (props.cart.current_status === 'complete') {
        return <StripeCheckout remoteCart={props.cart} cart={cart}/>;
    }

    return <SyncedCartManager remoteCart={props.cart} cart={cart}/>
};
