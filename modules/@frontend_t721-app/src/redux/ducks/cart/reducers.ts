import { Reducer }                                      from 'redux';
import { CartActionTypes, CartState }                                from './types';
import { CartAction, IAddTicket, ICompleteCartRestore, ISetTickets } from './actions';

export const cartInitialState: CartState = {
    tickets: [],
};

const AddTicketReducer: Reducer<CartState, IAddTicket> = (
    state: CartState,
    action: IAddTicket,
): CartState => ({
    ...state,
    tickets: [
        ...state.tickets,
        action.category
    ]
});

const SetTicketsReducer: Reducer<CartState, ISetTickets> = (
    state: CartState,
    action: ISetTickets,
): CartState => ({
    ...state,
    tickets: [
        ...action.tickets
    ]
});

const CompleteCartRestoreReducer: Reducer<CartState, ICompleteCartRestore> = (
    state: CartState,
    action: ICompleteCartRestore,
): CartState => ({
    ...action.cart
});

export const CartReducer: Reducer<CartState, CartAction> = (
    state: CartState = cartInitialState,
    action: CartAction,
): CartState => {
    switch (action.type) {
        case CartActionTypes.AddTicket:
            return AddTicketReducer(state, action as IAddTicket);
        case CartActionTypes.CompleteCartRestore:
            return CompleteCartRestoreReducer(state, action as ICompleteCartRestore);
        case CartActionTypes.SetTickets:
            return SetTicketsReducer(state, action as ISetTickets);
        default:
            return state;
    }
};
