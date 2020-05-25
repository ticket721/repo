import { ActionSetsService }                       from '@lib/common/actionsets/ActionSets.service';
import { T721TokenService }                        from '@lib/common/contracts/T721Token.service';
import { GemOrdersService }                        from '@lib/common/gemorders/GemOrders.service';
import { CheckoutInputHandlers, CheckoutResolve }  from '@app/worker/actionhandlers/checkout/Checkout.input.handlers';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test, TestingModule }                     from '@nestjs/testing';
import { ActionSetEntity }                         from '@lib/common/actionsets/entities/ActionSet.entity';
import { ActionSet }                               from '@lib/common/actionsets/helper/ActionSet.class';
import { GemOrderEntity }                          from '@lib/common/gemorders/entities/GemOrder.entity';
import regionRestrictions                          from '@app/server/controllers/checkout/restrictions/regionRestrictions.value';
import methodsRestrictions                         from '@app/server/controllers/checkout/restrictions/methodsRestrictions.value';
import { NestError }                               from '@lib/common/utils/NestError';

describe('Checkout Input Handlers', function() {
    const context: {
        checkoutInputHandlers: CheckoutInputHandlers;
        actionSetsServiceMock: ActionSetsService;
        t721TokenServiceMock: T721TokenService;
        gemOrdersServiceMock: GemOrdersService;
    } = {
        checkoutInputHandlers: null,
        actionSetsServiceMock: null,
        t721TokenServiceMock: null,
        gemOrdersServiceMock: null,
    };

    beforeEach(async function() {
        context.actionSetsServiceMock = mock(ActionSetsService);
        context.t721TokenServiceMock = mock(T721TokenService);
        context.gemOrdersServiceMock = mock(GemOrdersService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ActionSetsService,
                    useValue: instance(context.actionSetsServiceMock),
                },
                {
                    provide: T721TokenService,
                    useValue: instance(context.t721TokenServiceMock),
                },
                {
                    provide: GemOrdersService,
                    useValue: instance(context.gemOrdersServiceMock),
                },
                CheckoutInputHandlers,
            ],
        }).compile();

        context.checkoutInputHandlers = module.get<CheckoutInputHandlers>(CheckoutInputHandlers);
    });

    describe('checkoutResolve', function() {
        it('should properly validated stripe commit with valid cart, payment intent and gem order', async function() {
            const checkoutResolveFields = ['cartId', 'commitType'];

            const now = new Date(Date.now());

            const input: CheckoutResolve = {
                cartId: 'cart_id',
                commitType: 'stripe',
                buyer: 'buyer_address',
                stripe: {
                    paymentIntentId: 'payment_intent_id',
                    gemOrderId: 'gem_order_id',
                },
            };

            const rawActionSet: ActionSetEntity = {
                id: 'action_set_id',
                links: [],
                name: '@checkout/creation',
                dispatched_at: now,
                created_at: now,
                updated_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@checkout/resolve',
                        data: JSON.stringify(input),
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: null,
                        error: null,
                        status: 'waiting',
                        private: false,
                    },
                ],
                current_action: 0,
                current_status: 'input:in progress',
            };

            const rawGemOrderEntity = {
                gem: {
                    action_type: 'transfer',
                    error_info: null,
                    gem_data: '{}',
                    gem_payload: {
                        costs: [],
                        values: '{}',
                    },
                    gem_status: undefined,
                    operation_status: null,
                    refresh_timer: null,
                    route_history: [],
                    transfer_status: null,
                },
                distribution_id: 123,
                created_at: new Date(),
                updated_at: new Date(),
                id: 'abcd',
                circuit_name: 'name',
                initialized: true,
                initial_arguments: JSON.stringify({
                    paymentIntentId: 'payment_intent_id',
                    currency: 'eur',
                    amount: 100,
                    regionRestrictions,
                    methodsRestrictions,
                }),
                refresh_timer: 123,
            } as GemOrderEntity;

            const rawCartActionSet: ActionSetEntity = {
                id: 'cart_id',
                links: [],
                created_at: now,
                updated_at: now,
                name: '@cart/creation',
                dispatched_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}]}',
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/modulesConfiguration',
                        data: null,
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/authorizations',
                        data: `{\"authorizations\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"},\"authorizationId\":\"authorization_id\",\"groupId\":\"group_id\",\"categoryName\":\"category_name\",\"granter\":\"granter\",\"grantee\":\"grantee\",\"granterController\":\"granter_controller\",\"expiration\":\"${now}\"}],\"commitType\":\"stripe\",\"total\":[{\"currency\":\"T721Token\",\"value\":\"100\",\"log_value\":0}]}`,
                        error: null,
                        status: 'complete',
                        private: true,
                    },
                ],
                current_action: 2,
                current_status: 'complete',
            };

            const t721Instance = {
                methods: {
                    balanceOf: (...args: any[]) => ({
                        call: async () => 0,
                    }),
                },
            };

            when(context.t721TokenServiceMock.get()).thenResolve(t721Instance);

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rawCartActionSet],
            });

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rawGemOrderEntity],
            });

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutInputHandlers.checkoutResolveHandler(
                checkoutResolveFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.actions[0].status).toEqual('complete');
            expect(finalActionSet.current_action).toEqual(1);
            expect(finalActionSet.status).toEqual('event:in progress');

            verify(context.t721TokenServiceMock.get()).called();

            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).called();

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).called();
        });

        it('should properly validated balance commit with valid cart, payment intent and gem order', async function() {
            const checkoutResolveFields = ['cartId', 'commitType'];

            const now = new Date(Date.now());

            const input: CheckoutResolve = {
                cartId: 'cart_id',
                commitType: 'balance',
                buyer: 'buyer_address',
            };

            const rawActionSet: ActionSetEntity = {
                id: 'action_set_id',
                links: [],
                name: '@checkout/creation',
                dispatched_at: now,
                created_at: now,
                updated_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@checkout/resolve',
                        data: JSON.stringify(input),
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: null,
                        error: null,
                        status: 'waiting',
                        private: false,
                    },
                ],
                current_action: 0,
                current_status: 'input:in progress',
            };

            const rawCartActionSet: ActionSetEntity = {
                id: 'cart_id',
                links: [],
                created_at: now,
                updated_at: now,
                name: '@cart/creation',
                dispatched_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}]}',
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/modulesConfiguration',
                        data: null,
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/authorizations',
                        data: `{\"authorizations\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"},\"authorizationId\":\"authorization_id\",\"groupId\":\"group_id\",\"categoryName\":\"category_name\",\"granter\":\"granter\",\"grantee\":\"grantee\",\"granterController\":\"granter_controller\",\"expiration\":\"${now}\"}],\"commitType\":\"balance\",\"total\":[{\"currency\":\"T721Token\",\"value\":\"100\",\"log_value\":0}]}`,
                        error: null,
                        status: 'complete',
                        private: true,
                    },
                ],
                current_action: 2,
                current_status: 'complete',
            };

            const t721Instance = {
                methods: {
                    balanceOf: (...args: any[]) => ({
                        call: async () => 100,
                    }),
                },
            };

            when(context.t721TokenServiceMock.get()).thenResolve(t721Instance);

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rawCartActionSet],
            });

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutInputHandlers.checkoutResolveHandler(
                checkoutResolveFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.actions[0].status).toEqual('complete');
            expect(finalActionSet.current_action).toEqual(1);
            expect(finalActionSet.status).toEqual('event:in progress');

            verify(context.t721TokenServiceMock.get()).called();

            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).called();
        });

        it('should fail on input error', async function() {
            const checkoutResolveFields = ['cartId', 'commitType'];

            const now = new Date(Date.now());

            const input = {
                invalid_field: 'yes',
                cartId: 'cart_id',
                commitType: 'stripe',
                buyer: 'buyer_address',
                stripe: {
                    paymentIntentId: 'payment_intent_id',
                    gemOrderId: 'gem_order_id',
                },
            };

            const rawActionSet: ActionSetEntity = {
                id: 'action_set_id',
                links: [],
                name: '@checkout/creation',
                dispatched_at: now,
                created_at: now,
                updated_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@checkout/resolve',
                        data: JSON.stringify(input),
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: null,
                        error: null,
                        status: 'waiting',
                        private: false,
                    },
                ],
                current_action: 0,
                current_status: 'input:in progress',
            };

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutInputHandlers.checkoutResolveHandler(
                checkoutResolveFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.actions[0].status).toEqual('error');
            expect(finalActionSet.actions[0].error.error).toEqual('validation_error');
            expect(finalActionSet.current_action).toEqual(0);
            expect(finalActionSet.status).toEqual('input:error');
        });

        it('should fail on input incomplete error', async function() {
            const checkoutResolveFields = ['cartId', 'commitType'];

            const now = new Date(Date.now());

            const input = {
                commitType: 'stripe',
                buyer: 'buyer_address',
                stripe: {
                    paymentIntentId: 'payment_intent_id',
                    gemOrderId: 'gem_order_id',
                },
            };

            const rawActionSet: ActionSetEntity = {
                id: 'action_set_id',
                links: [],
                name: '@checkout/creation',
                dispatched_at: now,
                created_at: now,
                updated_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@checkout/resolve',
                        data: JSON.stringify(input),
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: null,
                        error: null,
                        status: 'waiting',
                        private: false,
                    },
                ],
                current_action: 0,
                current_status: 'input:in progress',
            };

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutInputHandlers.checkoutResolveHandler(
                checkoutResolveFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.actions[0].status).toEqual('incomplete');
            expect(finalActionSet.actions[0].error.error).toEqual('incomplete_error');
            expect(finalActionSet.current_action).toEqual(0);
            expect(finalActionSet.status).toEqual('input:incomplete');
        });

        it('should fail on cart fetch error', async function() {
            const checkoutResolveFields = ['cartId', 'commitType'];

            const now = new Date(Date.now());

            const input: CheckoutResolve = {
                cartId: 'cart_id',
                commitType: 'stripe',
                buyer: 'buyer_address',
                stripe: {
                    paymentIntentId: 'payment_intent_id',
                    gemOrderId: 'gem_order_id',
                },
            };

            const rawActionSet: ActionSetEntity = {
                id: 'action_set_id',
                links: [],
                name: '@checkout/creation',
                dispatched_at: now,
                created_at: now,
                updated_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@checkout/resolve',
                        data: JSON.stringify(input),
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: null,
                        error: null,
                        status: 'waiting',
                        private: false,
                    },
                ],
                current_action: 0,
                current_status: 'input:in progress',
            };

            const rawGemOrderEntity = {
                gem: {
                    action_type: 'transfer',
                    error_info: null,
                    gem_data: '{}',
                    gem_payload: {
                        costs: [],
                        values: '{}',
                    },
                    gem_status: undefined,
                    operation_status: null,
                    refresh_timer: null,
                    route_history: [],
                    transfer_status: null,
                },
                distribution_id: 123,
                created_at: new Date(),
                updated_at: new Date(),
                id: 'abcd',
                circuit_name: 'name',
                initialized: true,
                initial_arguments: JSON.stringify({
                    paymentIntentId: 'payment_intent_id',
                    currency: 'eur',
                    amount: 100,
                    regionRestrictions,
                    methodsRestrictions,
                }),
                refresh_timer: 123,
            } as GemOrderEntity;

            const rawCartActionSet: ActionSetEntity = {
                id: 'cart_id',
                links: [],
                created_at: now,
                updated_at: now,
                name: '@cart/creation',
                dispatched_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}]}',
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/modulesConfiguration',
                        data: null,
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/authorizations',
                        data: `{\"authorizations\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"},\"authorizationId\":\"authorization_id\",\"groupId\":\"group_id\",\"categoryName\":\"category_name\",\"granter\":\"granter\",\"grantee\":\"grantee\",\"granterController\":\"granter_controller\",\"expiration\":\"${now}\"}],\"commitType\":\"stripe\",\"total\":[{\"currency\":\"T721Token\",\"value\":\"100\",\"log_value\":0}]}`,
                        error: null,
                        status: 'complete',
                        private: true,
                    },
                ],
                current_action: 2,
                current_status: 'complete',
            };

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutInputHandlers.checkoutResolveHandler(
                checkoutResolveFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.actions[0].status).toEqual('error');
            expect(finalActionSet.current_action).toEqual(0);
            expect(finalActionSet.actions[0].error.error).toEqual('cannot_find_cart_actionset');
            expect(finalActionSet.status).toEqual('input:error');

            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).called();
        });

        it('should fail on empty cart error', async function() {
            const checkoutResolveFields = ['cartId', 'commitType'];

            const now = new Date(Date.now());

            const input: CheckoutResolve = {
                cartId: 'cart_id',
                commitType: 'stripe',
                buyer: 'buyer_address',
                stripe: {
                    paymentIntentId: 'payment_intent_id',
                    gemOrderId: 'gem_order_id',
                },
            };

            const rawActionSet: ActionSetEntity = {
                id: 'action_set_id',
                links: [],
                name: '@checkout/creation',
                dispatched_at: now,
                created_at: now,
                updated_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@checkout/resolve',
                        data: JSON.stringify(input),
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: null,
                        error: null,
                        status: 'waiting',
                        private: false,
                    },
                ],
                current_action: 0,
                current_status: 'input:in progress',
            };

            const rawGemOrderEntity = {
                gem: {
                    action_type: 'transfer',
                    error_info: null,
                    gem_data: '{}',
                    gem_payload: {
                        costs: [],
                        values: '{}',
                    },
                    gem_status: undefined,
                    operation_status: null,
                    refresh_timer: null,
                    route_history: [],
                    transfer_status: null,
                },
                distribution_id: 123,
                created_at: new Date(),
                updated_at: new Date(),
                id: 'abcd',
                circuit_name: 'name',
                initialized: true,
                initial_arguments: JSON.stringify({
                    paymentIntentId: 'payment_intent_id',
                    currency: 'eur',
                    amount: 100,
                    regionRestrictions,
                    methodsRestrictions,
                }),
                refresh_timer: 123,
            } as GemOrderEntity;

            const rawCartActionSet: ActionSetEntity = {
                id: 'cart_id',
                links: [],
                created_at: now,
                updated_at: now,
                name: '@cart/creation',
                dispatched_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}]}',
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/modulesConfiguration',
                        data: null,
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/authorizations',
                        data: `{\"authorizations\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"},\"authorizationId\":\"authorization_id\",\"groupId\":\"group_id\",\"categoryName\":\"category_name\",\"granter\":\"granter\",\"grantee\":\"grantee\",\"granterController\":\"granter_controller\",\"expiration\":\"${now}\"}],\"commitType\":\"stripe\",\"total\":[{\"currency\":\"T721Token\",\"value\":\"100\",\"log_value\":0}]}`,
                        error: null,
                        status: 'complete',
                        private: true,
                    },
                ],
                current_action: 2,
                current_status: 'complete',
            };

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutInputHandlers.checkoutResolveHandler(
                checkoutResolveFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.actions[0].status).toEqual('error');
            expect(finalActionSet.current_action).toEqual(0);
            expect(finalActionSet.actions[0].error.error).toEqual('cannot_find_cart_actionset');
            expect(finalActionSet.status).toEqual('input:error');

            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).called();
        });

        it('should fail on balance mode for fund check error', async function() {
            const checkoutResolveFields = ['cartId', 'commitType'];

            const now = new Date(Date.now());

            const input: CheckoutResolve = {
                cartId: 'cart_id',
                commitType: 'balance',
                buyer: 'buyer_address',
            };

            const rawActionSet: ActionSetEntity = {
                id: 'action_set_id',
                links: [],
                name: '@checkout/creation',
                dispatched_at: now,
                created_at: now,
                updated_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@checkout/resolve',
                        data: JSON.stringify(input),
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: null,
                        error: null,
                        status: 'waiting',
                        private: false,
                    },
                ],
                current_action: 0,
                current_status: 'input:in progress',
            };

            const rawGemOrderEntity = {
                gem: {
                    action_type: 'transfer',
                    error_info: null,
                    gem_data: '{}',
                    gem_payload: {
                        costs: [],
                        values: '{}',
                    },
                    gem_status: undefined,
                    operation_status: null,
                    refresh_timer: null,
                    route_history: [],
                    transfer_status: null,
                },
                distribution_id: 123,
                created_at: new Date(),
                updated_at: new Date(),
                id: 'abcd',
                circuit_name: 'name',
                initialized: true,
                initial_arguments: JSON.stringify({
                    paymentIntentId: 'payment_intent_id',
                    currency: 'eur',
                    amount: 100,
                    regionRestrictions,
                    methodsRestrictions,
                }),
                refresh_timer: 123,
            } as GemOrderEntity;

            const rawCartActionSet: ActionSetEntity = {
                id: 'cart_id',
                links: [],
                created_at: now,
                updated_at: now,
                name: '@cart/invalid',
                dispatched_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}]}',
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/modulesConfiguration',
                        data: null,
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/authorizations',
                        data: `{\"authorizations\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"},\"authorizationId\":\"authorization_id\",\"groupId\":\"group_id\",\"categoryName\":\"category_name\",\"granter\":\"granter\",\"grantee\":\"grantee\",\"granterController\":\"granter_controller\",\"expiration\":\"${now}\"}],\"commitType\":\"balance\",\"total\":[{\"currency\":\"T721Token\",\"value\":\"100\",\"log_value\":0}]}`,
                        error: null,
                        status: 'complete',
                        private: true,
                    },
                ],
                current_action: 2,
                current_status: 'complete',
            };

            const t721Instance = {
                methods: {
                    balanceOf: (...args: any[]) => ({
                        call: async () => 100,
                    }),
                },
            };

            when(context.t721TokenServiceMock.get()).thenResolve(t721Instance);

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rawCartActionSet],
            });

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutInputHandlers.checkoutResolveHandler(
                checkoutResolveFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.actions[0].status).toEqual('error');
            expect(finalActionSet.current_action).toEqual(0);
            expect(finalActionSet.actions[0].error.error).toEqual('invalid_provided_cart');
            expect(finalActionSet.status).toEqual('input:error');

            verify(context.t721TokenServiceMock.get()).called();

            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).called();
        });

        it('should fail on balance mode for funds too low', async function() {
            const checkoutResolveFields = ['cartId', 'commitType'];

            const now = new Date(Date.now());

            const input: CheckoutResolve = {
                cartId: 'cart_id',
                commitType: 'balance',
                buyer: 'buyer_address',
            };

            const rawActionSet: ActionSetEntity = {
                id: 'action_set_id',
                links: [],
                name: '@checkout/creation',
                dispatched_at: now,
                created_at: now,
                updated_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@checkout/resolve',
                        data: JSON.stringify(input),
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: null,
                        error: null,
                        status: 'waiting',
                        private: false,
                    },
                ],
                current_action: 0,
                current_status: 'input:in progress',
            };

            const rawCartActionSet: ActionSetEntity = {
                id: 'cart_id',
                links: [],
                created_at: now,
                updated_at: now,
                name: '@cart/creation',
                dispatched_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}]}',
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/modulesConfiguration',
                        data: null,
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/authorizations',
                        data: `{\"authorizations\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"},\"authorizationId\":\"authorization_id\",\"groupId\":\"group_id\",\"categoryName\":\"category_name\",\"granter\":\"granter\",\"grantee\":\"grantee\",\"granterController\":\"granter_controller\",\"expiration\":\"${now}\"}],\"commitType\":\"balance\",\"total\":[{\"currency\":\"T721Token\",\"value\":\"100\",\"log_value\":0}]}`,
                        error: null,
                        status: 'complete',
                        private: true,
                    },
                ],
                current_action: 2,
                current_status: 'complete',
            };

            const t721Instance = {
                methods: {
                    balanceOf: (...args: any[]) => ({
                        call: async () => 99,
                    }),
                },
            };

            when(context.t721TokenServiceMock.get()).thenResolve(t721Instance);

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rawCartActionSet],
            });

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutInputHandlers.checkoutResolveHandler(
                checkoutResolveFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.actions[0].status).toEqual('error');
            expect(finalActionSet.current_action).toEqual(0);
            expect(finalActionSet.actions[0].error.error).toEqual('not_enough_funds');
            expect(finalActionSet.status).toEqual('input:error');

            verify(context.t721TokenServiceMock.get()).called();

            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).called();
        });

        it('should fail on stripe mode missing stripe field', async function() {
            const checkoutResolveFields = ['cartId', 'commitType'];

            const now = new Date(Date.now());

            const input: CheckoutResolve = {
                cartId: 'cart_id',
                commitType: 'stripe',
                buyer: 'buyer_address',
            };

            const rawActionSet: ActionSetEntity = {
                id: 'action_set_id',
                links: [],
                name: '@checkout/creation',
                dispatched_at: now,
                created_at: now,
                updated_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@checkout/resolve',
                        data: JSON.stringify(input),
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: null,
                        error: null,
                        status: 'waiting',
                        private: false,
                    },
                ],
                current_action: 0,
                current_status: 'input:in progress',
            };

            const rawGemOrderEntity = {
                gem: {
                    action_type: 'transfer',
                    error_info: null,
                    gem_data: '{}',
                    gem_payload: {
                        costs: [],
                        values: '{}',
                    },
                    gem_status: undefined,
                    operation_status: null,
                    refresh_timer: null,
                    route_history: [],
                    transfer_status: null,
                },
                distribution_id: 123,
                created_at: new Date(),
                updated_at: new Date(),
                id: 'abcd',
                circuit_name: 'name',
                initialized: true,
                initial_arguments: JSON.stringify({
                    paymentIntentId: 'payment_intent_id',
                    currency: 'eur',
                    amount: 100,
                    regionRestrictions,
                    methodsRestrictions,
                }),
                refresh_timer: 123,
            } as GemOrderEntity;

            const rawCartActionSet: ActionSetEntity = {
                id: 'cart_id',
                links: [],
                created_at: now,
                updated_at: now,
                name: '@cart/creation',
                dispatched_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}]}',
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/modulesConfiguration',
                        data: null,
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/authorizations',
                        data: `{\"authorizations\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"},\"authorizationId\":\"authorization_id\",\"groupId\":\"group_id\",\"categoryName\":\"category_name\",\"granter\":\"granter\",\"grantee\":\"grantee\",\"granterController\":\"granter_controller\",\"expiration\":\"${now}\"}],\"commitType\":\"stripe\",\"total\":[{\"currency\":\"T721Token\",\"value\":\"100\",\"log_value\":0}]}`,
                        error: null,
                        status: 'complete',
                        private: true,
                    },
                ],
                current_action: 2,
                current_status: 'complete',
            };

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rawCartActionSet],
            });

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutInputHandlers.checkoutResolveHandler(
                checkoutResolveFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.actions[0].status).toEqual('error');
            expect(finalActionSet.current_action).toEqual(0);
            expect(finalActionSet.actions[0].error.error).toEqual('missing_stripe_field');
            expect(finalActionSet.status).toEqual('input:error');

            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).called();
        });

        it('should fail on stripe mode gem fetch error', async function() {
            const checkoutResolveFields = ['cartId', 'commitType'];

            const now = new Date(Date.now());

            const input: CheckoutResolve = {
                cartId: 'cart_id',
                commitType: 'stripe',
                buyer: 'buyer_address',
                stripe: {
                    paymentIntentId: 'payment_intent_id',
                    gemOrderId: 'gem_order_id',
                },
            };

            const rawActionSet: ActionSetEntity = {
                id: 'action_set_id',
                links: [],
                name: '@checkout/creation',
                dispatched_at: now,
                created_at: now,
                updated_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@checkout/resolve',
                        data: JSON.stringify(input),
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: null,
                        error: null,
                        status: 'waiting',
                        private: false,
                    },
                ],
                current_action: 0,
                current_status: 'input:in progress',
            };

            const rawGemOrderEntity = {
                gem: {
                    action_type: 'transfer',
                    error_info: null,
                    gem_data: '{}',
                    gem_payload: {
                        costs: [],
                        values: '{}',
                    },
                    gem_status: undefined,
                    operation_status: null,
                    refresh_timer: null,
                    route_history: [],
                    transfer_status: null,
                },
                distribution_id: 123,
                created_at: new Date(),
                updated_at: new Date(),
                id: 'abcd',
                circuit_name: 'name',
                initialized: true,
                initial_arguments: JSON.stringify({
                    paymentIntentId: 'payment_intent_id',
                    currency: 'eur',
                    amount: 100,
                    regionRestrictions,
                    methodsRestrictions,
                }),
                refresh_timer: 123,
            } as GemOrderEntity;

            const rawCartActionSet: ActionSetEntity = {
                id: 'cart_id',
                links: [],
                created_at: now,
                updated_at: now,
                name: '@cart/creation',
                dispatched_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}]}',
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/modulesConfiguration',
                        data: null,
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/authorizations',
                        data: `{\"authorizations\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"},\"authorizationId\":\"authorization_id\",\"groupId\":\"group_id\",\"categoryName\":\"category_name\",\"granter\":\"granter\",\"grantee\":\"grantee\",\"granterController\":\"granter_controller\",\"expiration\":\"${now}\"}],\"commitType\":\"stripe\",\"total\":[{\"currency\":\"T721Token\",\"value\":\"100\",\"log_value\":0}]}`,
                        error: null,
                        status: 'complete',
                        private: true,
                    },
                ],
                current_action: 2,
                current_status: 'complete',
            };

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rawCartActionSet],
            });

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutInputHandlers.checkoutResolveHandler(
                checkoutResolveFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.actions[0].status).toEqual('error');
            expect(finalActionSet.current_action).toEqual(0);
            expect(finalActionSet.actions[0].error.error).toEqual('cannot_find_gem_order');
            expect(finalActionSet.status).toEqual('input:error');

            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).called();

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).called();
        });

        it('should fail on stripe gem empty fetch', async function() {
            const checkoutResolveFields = ['cartId', 'commitType'];

            const now = new Date(Date.now());

            const input: CheckoutResolve = {
                cartId: 'cart_id',
                commitType: 'stripe',
                buyer: 'buyer_address',
                stripe: {
                    paymentIntentId: 'payment_intent_id',
                    gemOrderId: 'gem_order_id',
                },
            };

            const rawActionSet: ActionSetEntity = {
                id: 'action_set_id',
                links: [],
                name: '@checkout/creation',
                dispatched_at: now,
                created_at: now,
                updated_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@checkout/resolve',
                        data: JSON.stringify(input),
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: null,
                        error: null,
                        status: 'waiting',
                        private: false,
                    },
                ],
                current_action: 0,
                current_status: 'input:in progress',
            };

            const rawGemOrderEntity = {
                gem: {
                    action_type: 'transfer',
                    error_info: null,
                    gem_data: '{}',
                    gem_payload: {
                        costs: [],
                        values: '{}',
                    },
                    gem_status: undefined,
                    operation_status: null,
                    refresh_timer: null,
                    route_history: [],
                    transfer_status: null,
                },
                distribution_id: 123,
                created_at: new Date(),
                updated_at: new Date(),
                id: 'abcd',
                circuit_name: 'name',
                initialized: true,
                initial_arguments: JSON.stringify({
                    paymentIntentId: 'payment_intent_id',
                    currency: 'eur',
                    amount: 100,
                    regionRestrictions,
                    methodsRestrictions,
                }),
                refresh_timer: 123,
            } as GemOrderEntity;

            const rawCartActionSet: ActionSetEntity = {
                id: 'cart_id',
                links: [],
                created_at: now,
                updated_at: now,
                name: '@cart/creation',
                dispatched_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}]}',
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/modulesConfiguration',
                        data: null,
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/authorizations',
                        data: `{\"authorizations\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"},\"authorizationId\":\"authorization_id\",\"groupId\":\"group_id\",\"categoryName\":\"category_name\",\"granter\":\"granter\",\"grantee\":\"grantee\",\"granterController\":\"granter_controller\",\"expiration\":\"${now}\"}],\"commitType\":\"stripe\",\"total\":[{\"currency\":\"T721Token\",\"value\":\"100\",\"log_value\":0}]}`,
                        error: null,
                        status: 'complete',
                        private: true,
                    },
                ],
                current_action: 2,
                current_status: 'complete',
            };

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rawCartActionSet],
            });

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutInputHandlers.checkoutResolveHandler(
                checkoutResolveFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.actions[0].status).toEqual('error');
            expect(finalActionSet.current_action).toEqual(0);
            expect(finalActionSet.actions[0].error.error).toEqual('cannot_find_gem_order');
            expect(finalActionSet.status).toEqual('input:error');

            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).called();

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).called();
        });

        it('should fail on stripe mode funds check error', async function() {
            const checkoutResolveFields = ['cartId', 'commitType'];

            const now = new Date(Date.now());

            const input: CheckoutResolve = {
                cartId: 'cart_id',
                commitType: 'stripe',
                buyer: 'buyer_address',
                stripe: {
                    paymentIntentId: 'payment_intent_id',
                    gemOrderId: 'gem_order_id',
                },
            };

            const rawActionSet: ActionSetEntity = {
                id: 'action_set_id',
                links: [],
                name: '@checkout/creation',
                dispatched_at: now,
                created_at: now,
                updated_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@checkout/resolve',
                        data: JSON.stringify(input),
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: null,
                        error: null,
                        status: 'waiting',
                        private: false,
                    },
                ],
                current_action: 0,
                current_status: 'input:in progress',
            };

            const rawGemOrderEntity = {
                gem: {
                    action_type: 'transfer',
                    error_info: null,
                    gem_data: '{}',
                    gem_payload: {
                        costs: [],
                        values: '{}',
                    },
                    gem_status: undefined,
                    operation_status: null,
                    refresh_timer: null,
                    route_history: [],
                    transfer_status: null,
                },
                distribution_id: 123,
                created_at: new Date(),
                updated_at: new Date(),
                id: 'abcd',
                circuit_name: 'name',
                initialized: true,
                initial_arguments: JSON.stringify({
                    paymentIntentId: 'payment_intent_id',
                    currency: 'eur',
                    amount: 100,
                    regionRestrictions,
                    methodsRestrictions,
                }),
                refresh_timer: 123,
            } as GemOrderEntity;

            const rawCartActionSet: ActionSetEntity = {
                id: 'cart_id',
                links: [],
                created_at: now,
                updated_at: now,
                name: '@cart/invalid',
                dispatched_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}]}',
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/modulesConfiguration',
                        data: null,
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/authorizations',
                        data: `{\"authorizations\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"},\"authorizationId\":\"authorization_id\",\"groupId\":\"group_id\",\"categoryName\":\"category_name\",\"granter\":\"granter\",\"grantee\":\"grantee\",\"granterController\":\"granter_controller\",\"expiration\":\"${now}\"}],\"commitType\":\"stripe\",\"total\":[{\"currency\":\"T721Token\",\"value\":\"100\",\"log_value\":0}]}`,
                        error: null,
                        status: 'complete',
                        private: true,
                    },
                ],
                current_action: 2,
                current_status: 'complete',
            };

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rawCartActionSet],
            });

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rawGemOrderEntity],
            });

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutInputHandlers.checkoutResolveHandler(
                checkoutResolveFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.actions[0].status).toEqual('error');
            expect(finalActionSet.current_action).toEqual(0);
            expect(finalActionSet.actions[0].error.error).toEqual('invalid_provided_cart');
            expect(finalActionSet.status).toEqual('input:error');

            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).called();

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).called();
        });

        it('should fail on stripe mode funds too low', async function() {
            const checkoutResolveFields = ['cartId', 'commitType'];

            const now = new Date(Date.now());

            const input: CheckoutResolve = {
                cartId: 'cart_id',
                commitType: 'stripe',
                buyer: 'buyer_address',
                stripe: {
                    paymentIntentId: 'payment_intent_id',
                    gemOrderId: 'gem_order_id',
                },
            };

            const rawActionSet: ActionSetEntity = {
                id: 'action_set_id',
                links: [],
                name: '@checkout/creation',
                dispatched_at: now,
                created_at: now,
                updated_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@checkout/resolve',
                        data: JSON.stringify(input),
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: null,
                        error: null,
                        status: 'waiting',
                        private: false,
                    },
                ],
                current_action: 0,
                current_status: 'input:in progress',
            };

            const rawGemOrderEntity = {
                gem: {
                    action_type: 'transfer',
                    error_info: null,
                    gem_data: '{}',
                    gem_payload: {
                        costs: [],
                        values: '{}',
                    },
                    gem_status: undefined,
                    operation_status: null,
                    refresh_timer: null,
                    route_history: [],
                    transfer_status: null,
                },
                distribution_id: 123,
                created_at: new Date(),
                updated_at: new Date(),
                id: 'abcd',
                circuit_name: 'name',
                initialized: true,
                initial_arguments: JSON.stringify({
                    paymentIntentId: 'payment_intent_id',
                    currency: 'eur',
                    amount: 99,
                    regionRestrictions,
                    methodsRestrictions,
                }),
                refresh_timer: 123,
            } as GemOrderEntity;

            const rawCartActionSet: ActionSetEntity = {
                id: 'cart_id',
                links: [],
                created_at: now,
                updated_at: now,
                name: '@cart/creation',
                dispatched_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}]}',
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/modulesConfiguration',
                        data: null,
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/authorizations',
                        data: `{\"authorizations\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"},\"authorizationId\":\"authorization_id\",\"groupId\":\"group_id\",\"categoryName\":\"category_name\",\"granter\":\"granter\",\"grantee\":\"grantee\",\"granterController\":\"granter_controller\",\"expiration\":\"${now}\"}],\"commitType\":\"stripe\",\"total\":[{\"currency\":\"T721Token\",\"value\":\"100\",\"log_value\":0}]}`,
                        error: null,
                        status: 'complete',
                        private: true,
                    },
                ],
                current_action: 2,
                current_status: 'complete',
            };

            const t721Instance = {
                methods: {
                    balanceOf: (...args: any[]) => ({
                        call: async () => 0,
                    }),
                },
            };

            when(context.t721TokenServiceMock.get()).thenResolve(t721Instance);

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rawCartActionSet],
            });

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rawGemOrderEntity],
            });

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutInputHandlers.checkoutResolveHandler(
                checkoutResolveFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.actions[0].status).toEqual('error');
            expect(finalActionSet.current_action).toEqual(0);
            expect(finalActionSet.actions[0].error.error).toEqual('not_enough_funds');
            expect(finalActionSet.status).toEqual('input:error');

            verify(context.t721TokenServiceMock.get()).called();

            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).called();

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).called();
        });

        it('should fail on ethereum balance check error', async function() {
            const checkoutResolveFields = ['cartId', 'commitType'];

            const now = new Date(Date.now());

            const input: CheckoutResolve = {
                cartId: 'cart_id',
                commitType: 'stripe',
                buyer: 'buyer_address',
                stripe: {
                    paymentIntentId: 'payment_intent_id',
                    gemOrderId: 'gem_order_id',
                },
            };

            const rawActionSet: ActionSetEntity = {
                id: 'action_set_id',
                links: [],
                name: '@checkout/creation',
                dispatched_at: now,
                created_at: now,
                updated_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@checkout/resolve',
                        data: JSON.stringify(input),
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: null,
                        error: null,
                        status: 'waiting',
                        private: false,
                    },
                ],
                current_action: 0,
                current_status: 'input:in progress',
            };

            const rawGemOrderEntity = {
                gem: {
                    action_type: 'transfer',
                    error_info: null,
                    gem_data: '{}',
                    gem_payload: {
                        costs: [],
                        values: '{}',
                    },
                    gem_status: undefined,
                    operation_status: null,
                    refresh_timer: null,
                    route_history: [],
                    transfer_status: null,
                },
                distribution_id: 123,
                created_at: new Date(),
                updated_at: new Date(),
                id: 'abcd',
                circuit_name: 'name',
                initialized: true,
                initial_arguments: JSON.stringify({
                    paymentIntentId: 'payment_intent_id',
                    currency: 'eur',
                    amount: 100,
                    regionRestrictions,
                    methodsRestrictions,
                }),
                refresh_timer: 123,
            } as GemOrderEntity;

            const rawCartActionSet: ActionSetEntity = {
                id: 'cart_id',
                links: [],
                created_at: now,
                updated_at: now,
                name: '@cart/creation',
                dispatched_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}]}',
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/modulesConfiguration',
                        data: null,
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/authorizations',
                        data: `{\"authorizations\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"},\"authorizationId\":\"authorization_id\",\"groupId\":\"group_id\",\"categoryName\":\"category_name\",\"granter\":\"granter\",\"grantee\":\"grantee\",\"granterController\":\"granter_controller\",\"expiration\":\"${now}\"}],\"commitType\":\"stripe\",\"total\":[{\"currency\":\"T721Token\",\"value\":\"100\",\"log_value\":0}]}`,
                        error: null,
                        status: 'complete',
                        private: true,
                    },
                ],
                current_action: 2,
                current_status: 'complete',
            };

            const t721Instance = {
                methods: {
                    balanceOf: (...args: any[]) => ({
                        call: async () => {
                            throw new NestError('cannot contact ethereum');
                        },
                    }),
                },
            };

            when(context.t721TokenServiceMock.get()).thenResolve(t721Instance);

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rawCartActionSet],
            });

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rawGemOrderEntity],
            });

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutInputHandlers.checkoutResolveHandler(
                checkoutResolveFields,
                actionSet,
                async () => {},
            );
            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.actions[0].status).toEqual('error');
            expect(finalActionSet.current_action).toEqual(0);
            expect(finalActionSet.actions[0].error.error).toEqual('cannot_get_current_balance');
            expect(finalActionSet.status).toEqual('input:error');

            verify(context.t721TokenServiceMock.get()).called();

            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).called();

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).called();
        });

        it('should fail gem order amount check', async function() {
            const checkoutResolveFields = ['cartId', 'commitType'];

            const now = new Date(Date.now());

            const input: CheckoutResolve = {
                cartId: 'cart_id',
                commitType: 'stripe',
                buyer: 'buyer_address',
                stripe: {
                    paymentIntentId: 'payment_intent_id',
                    gemOrderId: 'gem_order_id',
                },
            };

            const rawActionSet: ActionSetEntity = {
                id: 'action_set_id',
                links: [],
                name: '@checkout/creation',
                dispatched_at: now,
                created_at: now,
                updated_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@checkout/resolve',
                        data: JSON.stringify(input),
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: null,
                        error: null,
                        status: 'waiting',
                        private: false,
                    },
                ],
                current_action: 0,
                current_status: 'input:in progress',
            };

            const rawGemOrderEntity = {
                gem: {
                    action_type: 'transfer',
                    error_info: null,
                    gem_data: '{}',
                    gem_payload: {
                        costs: [],
                        values: '{}',
                    },
                    gem_status: undefined,
                    operation_status: null,
                    refresh_timer: null,
                    route_history: [],
                    transfer_status: null,
                },
                distribution_id: 123,
                created_at: new Date(),
                updated_at: new Date(),
                id: 'abcd',
                circuit_name: 'name',
                initialized: true,
                initial_arguments: null,
                refresh_timer: 123,
            } as GemOrderEntity;

            const rawCartActionSet: ActionSetEntity = {
                id: 'cart_id',
                links: [],
                created_at: now,
                updated_at: now,
                name: '@cart/creation',
                dispatched_at: now,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}]}',
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/modulesConfiguration',
                        data: null,
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/authorizations',
                        data: `{\"authorizations\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"},\"authorizationId\":\"authorization_id\",\"groupId\":\"group_id\",\"categoryName\":\"category_name\",\"granter\":\"granter\",\"grantee\":\"grantee\",\"granterController\":\"granter_controller\",\"expiration\":\"${now}\"}],\"commitType\":\"stripe\",\"total\":[{\"currency\":\"T721Token\",\"value\":\"100\",\"log_value\":0}]}`,
                        error: null,
                        status: 'complete',
                        private: true,
                    },
                ],
                current_action: 2,
                current_status: 'complete',
            };

            const t721Instance = {
                methods: {
                    balanceOf: (...args: any[]) => ({
                        call: async () => 0,
                    }),
                },
            };

            when(context.t721TokenServiceMock.get()).thenResolve(t721Instance);

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rawCartActionSet],
            });

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rawGemOrderEntity],
            });

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutInputHandlers.checkoutResolveHandler(
                checkoutResolveFields,
                actionSet,
                async () => {},
            );
            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.actions[0].status).toEqual('error');
            expect(finalActionSet.current_action).toEqual(0);
            expect(finalActionSet.actions[0].error.error).toEqual('cannot_extract_gem_amount');
            expect(finalActionSet.status).toEqual('input:error');

            verify(context.t721TokenServiceMock.get()).called();

            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: 'cart_id',
                    }),
                ),
            ).called();

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).called();
        });
    });
});
