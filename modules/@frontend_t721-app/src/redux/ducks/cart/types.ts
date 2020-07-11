import { CategoryEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';

export enum CartActionTypes {
    CompleteCartRestore = '@@cart/completecartrestore',
    AddTicket = '@@cart/addticket',
    SetTickets = `@@cart/settickets`
}

export interface CartState {
    tickets: CategoryEntity[];
}

