import { AxiosResponse }            from 'axios';
import { ActionsUpdateResponseDto }          from '@app/server/controllers/actionsets/dto/ActionsUpdateResponse.dto';
import { actionsUpdate}                                   from './actions';
import { CartModulesConfiguration, CartTicketSelections } from '@app/worker/actionhandlers/cart/Cart.input.handlers';

export async function cartTicketSelections(
    token: string,
    actionset: string,
    query: CartTicketSelections,
): Promise<AxiosResponse<ActionsUpdateResponseDto>> {

    return (actionsUpdate.bind(this))(
        token,
        actionset,
        {
            data: query,
            action_idx: 0,
        },
    );
}

export async function cartModulesConfiguration(
    token: string,
    actionset: string,
    query: CartModulesConfiguration,
): Promise<AxiosResponse<ActionsUpdateResponseDto>> {

    return (actionsUpdate.bind(this))(
        token,
        actionset,
        {
            data: query,
            action_idx: 1,
        },
    );
}


