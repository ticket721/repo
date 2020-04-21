import { ActionSetBuilderBase } from '@lib/common/actionsets/helper/ActionSet.builder.base';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { Action } from '@lib/common/actionsets/helper/Action.class';
import { UserDto } from '@lib/common/users/dto/User.dto';
import Joi from '@hapi/joi';

// tslint:disable-next-line:no-empty-interface
export interface CartAcsetBuilderArgs {}

const CartAcsetBuilderChecker = Joi.object({});

export class CartAcsetbuilderHelper implements ActionSetBuilderBase<CartAcsetBuilderArgs> {
    async buildActionSet(caller: UserDto, args: CartAcsetBuilderArgs): Promise<ServiceResponse<ActionSet>> {
        const { error, value } = CartAcsetBuilderChecker.validate(args);

        if (error) {
            return {
                error: 'acset_invalid_arguments',
                response: null,
            };
        }

        args = value;

        const actions: Action[] = [
            new Action()
                .setName('@cart/ticketSelections')
                .setData<CartAcsetBuilderArgs>(args)
                .setType('input')
                .setStatus('in progress'),
            new Action()
                .setName('@cart/modulesConfiguration')
                .setType('input')
                .setStatus('in progress'),
            new Action()
                .setName('@cart/authorizations')
                .setType('input')
                .setStatus('in progress')
                .setPrivacy(true),
        ];
        return {
            error: null,
            response: new ActionSet()
                .setName('@cart/creation')
                .setActions(actions)
                .setStatus('input:in progress'),
        };
    }
}
