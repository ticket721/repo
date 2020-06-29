import { Action }                     from 'redux';
import { CategoryEntity }             from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { CartActionTypes, CartState } from './types';

export interface IAddTicket extends Action<string> {
    type: CartActionTypes.AddTicket;
    category: CategoryEntity;
}

export const AddTicket = (category: CategoryEntity): IAddTicket => ({
    type: CartActionTypes.AddTicket,
    category,
});

export interface ISetTickets extends Action<string> {
    type: CartActionTypes.SetTickets;
    tickets: CategoryEntity[];
}

export const SetTickets = (tickets: CategoryEntity[]): ISetTickets => ({
    type: CartActionTypes.SetTickets,
    tickets,
});

export interface ICompleteCartRestore extends Action<string> {
    type: CartActionTypes.CompleteCartRestore;
    cart: CartState;
}

export const CompleteCartRestore = (cart: CartState): ICompleteCartRestore => ({
    type: CartActionTypes.CompleteCartRestore,
    cart
});

export type CartAction = IAddTicket | ICompleteCartRestore | ISetTickets;
