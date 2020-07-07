import { ActionSetEntity }            from '@common/sdk/lib/@backend_nest/libs/common/src/actionsets/entities/ActionSet.entity';
import React, { useState } from 'react';
import { useSelector }   from 'react-redux';
import { T721AppState }             from '../../redux';
import { v4 }                       from 'uuid';
import { useLazyRequest }           from '@frontend/core/lib/hooks/useLazyRequest';
import { ActionsUpdateResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/actionsets/dto/ActionsUpdateResponse.dto';
import { CartState }                from '../../redux/ducks/cart';
import { FullPageLoading, Error }   from '@frontend/flib-react/lib/components';
import { useDeepEffect }            from '@frontend/core/lib/hooks/useDeepEffect';
import { TicketMintingFormat }      from '@common/sdk/lib/@backend_nest/libs/common/src/utils/Cart.type';
import { CategoryEntity }           from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { InputPrice, Price }        from '@common/sdk/lib/@backend_nest/libs/common/src/currencies/Currencies.service';
import { SyncedCartSelectGroupId }  from './SyncedCartSelectGroupId';
import { SyncedCartRemoveTickets }  from './SyncedCartRemoveTickets';
import { SyncedCartNotifyErrors }   from './SyncedCartNotifyErrors';

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

    useDeepEffect(() => {

        const tickets = convertPendingToMintingFormat(cart);

        if (!ticketsSelection.response.called) {
            ticketsSelection.lazyRequest([
                token,
                props.cart.id,
                {
                    tickets,
                },
            ], {
                force: true
            });
        }

    }, [props.cart]);

    if (ticketsSelection.response.error) {
        return <Error message={'Cannot update cart'}/>;
    }

    return <FullPageLoading/>;
};

export interface SyncedCartManagerProps {
    cart: ActionSetEntity;
}

export const SyncedCartManager: React.FC<SyncedCartManagerProps> = (props: SyncedCartManagerProps): JSX.Element => {
    const ticketSelectionsAction = props.cart.actions[0];

    if (ticketSelectionsAction.error) {
        const errorData = JSON.parse(ticketSelectionsAction.error);
        switch (errorData.error) {
            case 'cart_too_big': {
                return <SyncedCartRemoveTickets cart={props.cart}/>;
            }
            case 'cannot_purchase_multiple_group_id': {
                return <SyncedCartSelectGroupId cart={props.cart}/>;
            }
            case 'cannot_purchase_tickets': {
                return <SyncedCartNotifyErrors errors={errorData.details}/>;
            }
            default: {
                return <Error message={'unexpected error'}/>;
            }
        }
    }

    return <p>Synced but maybe not ok</p>;
};

export const CartManager: React.FC<CartManagerProps> = (props: CartManagerProps): JSX.Element => {

    const { cart } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value, cart: state.cart }));

    const ticketSelectionsAction = props.cart.actions[0];
    const ticketSelectionsActionData = JSON.parse(ticketSelectionsAction.data);

    if (!isLocalTicketsInSyncWithActionSetTicket(cart, ticketSelectionsActionData)) {

        return <CartAddPendingTickets cart={props.cart} />;

    }

    return <SyncedCartManager cart={props.cart}/>
};
