import { Action }          from 'redux';
import { CategoryEntity }  from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { CartActionTypes } from './types';

export interface IAddPendingTicket extends Action<string> {
    type: CartActionTypes.AddPendingTicket;
    category: CategoryEntity;
}

export const AddPendingTicket = (category: CategoryEntity): IAddPendingTicket => ({
    type: CartActionTypes.AddPendingTicket,
    category,
});

export type CartAction = IAddPendingTicket;
