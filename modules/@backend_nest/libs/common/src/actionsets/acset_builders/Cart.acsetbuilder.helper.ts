import { ActionSetBuilderBase } from '@lib/common/actionsets/helper/ActionSet.builder.base';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { Action } from '@lib/common/actionsets/helper/Action.class';
import { UserDto } from '@lib/common/users/dto/User.dto';
import Joi from '@hapi/joi';

/**
 * Input arguments for the Cart AcSet Builder
 */
// tslint:disable-next-line:no-empty-interface
export interface CartAcsetBuilderArgs {}

/**
 * Data Validator for the Cart Acset Builder
 */
const CartAcsetBuilderChecker = Joi.object({});

/**
 * Enum containing the indexes of all step for the Cart Creation actionset
 */
export enum CartCreationActions {
    TicketSelections,
    ModulesConfiguration,
    Authorizations,
}

/**
 * Helper class containing the build method for the cart acset
 */
export class CartAcsetbuilderHelper implements ActionSetBuilderBase<CartAcsetBuilderArgs> {
    /**
     * Builder of the Cart Action Sets
     *
     * @param caller
     * @param args
     */
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
