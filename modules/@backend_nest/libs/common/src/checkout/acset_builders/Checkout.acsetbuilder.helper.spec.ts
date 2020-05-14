import {
    CheckoutAcsetBuilderArgs,
    CheckoutAcsetbuilderHelper,
} from '@lib/common/checkout/acset_builders/Checkout.acsetbuilder.helper';
import { UserDto } from '@lib/common/users/dto/User.dto';

describe('Checkout AcSet Builder', function() {
    const context: {
        checkoutAcsetBuilderHelper: CheckoutAcsetbuilderHelper;
    } = {
        checkoutAcsetBuilderHelper: null,
    };

    beforeEach(function() {
        context.checkoutAcsetBuilderHelper = new CheckoutAcsetbuilderHelper();
    });

    it('should properly build the actionset', async function() {
        const user: UserDto = {
            id: 'user_id',
        } as UserDto;

        const args: CheckoutAcsetBuilderArgs = {};

        const actionSetBuilderResponse = await context.checkoutAcsetBuilderHelper.buildActionSet(user, args);

        expect(actionSetBuilderResponse.error).toEqual(null);
        expect(actionSetBuilderResponse.response.raw).toEqual({
            actions: [
                {
                    data: '{}',
                    error: null,
                    name: '@checkout/resolve',
                    private: false,
                    status: 'in progress',
                    type: 'input',
                },
                {
                    data: '{}',
                    error: null,
                    name: '@checkout/progress',
                    private: true,
                    status: 'in progress',
                    type: 'event',
                },
            ],
            current_action: 0,
            current_status: 'input:in progress',
            dispatched_at: actionSetBuilderResponse.response.raw.dispatched_at,
            name: '@checkout/creation',
        });
    });

    it('should fail on validation error', async function() {
        const user: UserDto = {
            id: 'user_id',
        } as UserDto;

        const args: CheckoutAcsetBuilderArgs = {
            invalid: 'field',
        };

        const actionSetBuilderResponse = await context.checkoutAcsetBuilderHelper.buildActionSet(user, args);

        expect(actionSetBuilderResponse.error).toEqual('acset_invalid_arguments');
        expect(actionSetBuilderResponse.response).toEqual(null);
    });
});
