import { CategoryEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';

export enum CartActionTypes {
    AddPendingTicket = '@@cart/addpendingticket'
}

export interface CartState {
    ticketsToAdd: CategoryEntity[];
    addedTickets: CategoryEntity[];
    id: string;
}

