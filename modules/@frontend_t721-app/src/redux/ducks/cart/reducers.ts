import { Reducer }                                                                                       from 'redux';
import { CartActionTypes, CartState }                                from './types';
import { CartAction, IAddPendingTicket } from './actions';

export const cartInitialState: CartState = {
    ticketsToAdd: [],
    addedTickets: [],
    id: null,
};

const AddPendingTicketReducer: Reducer<CartState, IAddPendingTicket> = (
    state: CartState,
    action: IAddPendingTicket,
): CartState => ({
    ...state,
    ticketsToAdd: [
        ...state.ticketsToAdd,
        action.category
    ]
});

export const CartReducer: Reducer<CartState, CartAction> = (
    state: CartState = cartInitialState,
    action: CartAction,
): CartState => {
    switch (action.type) {
        case CartActionTypes.AddPendingTicket:
            return AddPendingTicketReducer(state, action as IAddPendingTicket);
        default:
            return state;
    }
};
