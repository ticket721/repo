import { UserDto } from '@lib/common/users/dto/User.dto';
import { CartAcsetBuilderArgs, CartAcsetbuilderHelper } from '@lib/common/cart/acset_builders/Cart.acsetbuilder.helper';

describe('Cart AcSetBuilder Helper', function() {
    const context: {
        cartAcsetBuilderHelper: CartAcsetbuilderHelper;
    } = {
        cartAcsetBuilderHelper: null,
    };

    beforeEach(async function() {
        context.cartAcsetBuilderHelper = new CartAcsetbuilderHelper();
    });

    it('should properly build initial event creation actionset for user', async function() {
        const user = {
            id: 'user_id',
        } as UserDto;

        const initialArguments: CartAcsetBuilderArgs = {};

        const actionSet = await context.cartAcsetBuilderHelper.buildActionSet(user, initialArguments);

        expect(actionSet.response.raw).toEqual({
            name: '@cart/creation',
            consumed: false,
            dispatched_at: actionSet.response.raw.dispatched_at,
            actions: [
                {
                    type: 'input',
                    name: '@cart/ticketSelections',
                    data: '{}',
                    error: null,
                    status: 'in progress',
                    private: false,
                },
                {
                    type: 'input',
                    name: '@cart/modulesConfiguration',
                    data: null,
                    error: null,
                    status: 'in progress',
                    private: false,
                },
                {
                    type: 'input',
                    name: '@cart/authorizations',
                    data: null,
                    error: null,
                    status: 'in progress',
                    private: true,
                },
            ],
            current_action: 0,
            current_status: 'input:in progress',
        });
        expect(actionSet.error).toEqual(null);
    });

    it('should fail on args validation', async function() {
        const user = {
            id: 'user_id',
        } as UserDto;

        const initialArguments: CartAcsetBuilderArgs = {
            invalid_field: true,
        } as CartAcsetBuilderArgs;

        const actionSet = await context.cartAcsetBuilderHelper.buildActionSet(user, initialArguments);

        expect(actionSet.error).toEqual('acset_invalid_arguments');
        expect(actionSet.response).toEqual(null);
    });
});
