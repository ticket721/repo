import { ActionSetBuilderBase } from '@lib/common/actionsets/helper/ActionSet.builder.base';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { Action } from '@lib/common/actionsets/helper/Action.class';
import { UserDto } from '@lib/common/users/dto/User.dto';
import Joi from '@hapi/joi';

/**
 * Input arguments for the Checkout AcSet Builder
 */
// tslint:disable-next-line:no-empty-interface
export interface CheckoutAcsetBuilderArgs {}

/**
 * Data Validator for the Checkout Acset Builder
 */
const CheckoutAcsetBuilderChecker = Joi.object({});

/**
 * Enum containing the indexes of all step for the Checkout Creation actionset
 */
export enum CheckoutCreationActions {
    Resolve,
    Progress,
}

/**
 * Helper class containing the build method for the cart acset
 */
export class CheckoutAcsetbuilderHelper implements ActionSetBuilderBase<CheckoutAcsetBuilderArgs> {

    public isPrivate: boolean = true;

    /**
     * Builder of the Checkout Action Sets
     *
     * @param caller
     * @param args
     */
    async buildActionSet(caller: UserDto, args: CheckoutAcsetBuilderArgs): Promise<ServiceResponse<ActionSet>> {
        const { error, value } = CheckoutAcsetBuilderChecker.validate(args);

        if (error) {
            return {
                error: 'acset_invalid_arguments',
                response: null,
            };
        }

        args = value;

        const actions: Action[] = [
            new Action()
                .setName('@checkout/resolve')
                .setData<CheckoutAcsetBuilderArgs>(args)
                .setType('input')
                .setStatus('in progress'),
            new Action()
                .setName('@checkout/progress')
                .setData({})
                .setType('event')
                .setStatus('in progress')
                .setPrivacy(true),
        ];
        return {
            error: null,
            response: new ActionSet()
                .setName('@checkout/creation')
                .setActions(actions)
                .setStatus('input:in progress'),
        };
    }
}
