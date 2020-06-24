import { CheckoutInputHandlers, CheckoutResolve } from '@app/worker/actionhandlers/checkout/Checkout.input.handlers';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import regionRestrictions from '@app/server/controllers/checkout/restrictions/regionRestrictions.value';
import methodsRestrictions from '@app/server/controllers/checkout/restrictions/methodsRestrictions.value';
import { GemOrderEntity } from '@lib/common/gemorders/entities/GemOrder.entity';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { GemOrdersService } from '@lib/common/gemorders/GemOrders.service';
import { CheckoutEventHandlers } from '@app/worker/actionhandlers/checkout/Checkout.event.handlers';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';

describe('Checkout Event Handlers', function() {
    const context: {
        checkoutEventHandlers: CheckoutEventHandlers;
        actionSetsServiceMock: ActionSetsService;
        gemOrdersServiceMock: GemOrdersService;
    } = {
        checkoutEventHandlers: null,
        actionSetsServiceMock: null,
        gemOrdersServiceMock: null,
    };

    beforeEach(async function() {
        context.actionSetsServiceMock = mock(ActionSetsService);
        context.gemOrdersServiceMock = mock(GemOrdersService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ActionSetsService,
                    useValue: instance(context.actionSetsServiceMock),
                },
                {
                    provide: GemOrdersService,
                    useValue: instance(context.gemOrdersServiceMock),
                },
                CheckoutEventHandlers,
            ],
        }).compile();

        context.checkoutEventHandlers = module.get<CheckoutEventHandlers>(CheckoutEventHandlers);
    });

    describe('checkoutProgress', function() {
        it('should properly validate gem step in stripe mode', async function() {
            const checkoutEventHandlerFields = [];

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
                consumed: false,
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
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: '{}',
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                ],
                current_action: 1,
                current_status: 'event:in progress',
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
                    gem_status: 'Complete',
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

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutEventHandlers.checkoutProgressHandler(
                checkoutEventHandlerFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.status).toEqual('complete');

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).called();
        });

        it('should properly validate gem step in balance mode', async function() {
            const checkoutEventHandlerFields = [];

            const now = new Date(Date.now());

            const input: CheckoutResolve = {
                cartId: 'cart_id',
                commitType: 'balance',
                buyer: 'buyer_address',
                stripe: {
                    paymentIntentId: 'payment_intent_id',
                    gemOrderId: 'gem_order_id',
                },
            };

            const rawActionSet: ActionSetEntity = {
                id: 'action_set_id',
                consumed: false,
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
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: '{}',
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                ],
                current_action: 1,
                current_status: 'event:in progress',
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
                    gem_status: 'Complete',
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

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutEventHandlers.checkoutProgressHandler(
                checkoutEventHandlerFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.status).toEqual('complete');
        });

        it('should fail on validation error', async function() {
            const checkoutEventHandlerFields = [];

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
                consumed: false,
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
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: JSON.stringify({ invalid: 'field' }),
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                ],
                current_action: 1,
                current_status: 'event:in progress',
            };

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutEventHandlers.checkoutProgressHandler(
                checkoutEventHandlerFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.status).toEqual('event:error');
            expect(finalActionSet.action.error.error).toEqual('validation_error');
        });

        it('should not update if gem not resolved', async function() {
            const checkoutEventHandlerFields = [];

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
                consumed: false,
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
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: '{}',
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                ],
                current_action: 1,
                current_status: 'event:in progress',
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
                    gem_status: 'Running',
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

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutEventHandlers.checkoutProgressHandler(
                checkoutEventHandlerFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(false);
            expect(finalActionSet.status).toEqual('event:in progress');

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).called();
        });

        it('should fail on Error gem status', async function() {
            const checkoutEventHandlerFields = [];

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
                consumed: false,
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
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: '{}',
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                ],
                current_action: 1,
                current_status: 'event:in progress',
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
                    gem_status: 'Error',
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

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutEventHandlers.checkoutProgressHandler(
                checkoutEventHandlerFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.status).toEqual('event:error');
            expect(finalActionSet.action.error.error).toEqual('dosojin_circuit_failed');

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).called();
        });

        it('should fail on Fatal gem status', async function() {
            const checkoutEventHandlerFields = [];

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
                consumed: false,
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
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: '{}',
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                ],
                current_action: 1,
                current_status: 'event:in progress',
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
                    gem_status: 'Fatal',
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

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutEventHandlers.checkoutProgressHandler(
                checkoutEventHandlerFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.status).toEqual('event:error');
            expect(finalActionSet.action.error.error).toEqual('dosojin_circuit_failed');

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).called();
        });

        it('should fail on MissingReceptacle gem status', async function() {
            const checkoutEventHandlerFields = [];

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
                consumed: false,
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
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: '{}',
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                ],
                current_action: 1,
                current_status: 'event:in progress',
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
                    gem_status: 'MissingReceptacle',
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

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutEventHandlers.checkoutProgressHandler(
                checkoutEventHandlerFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.status).toEqual('event:error');
            expect(finalActionSet.action.error.error).toEqual('dosojin_circuit_failed');

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).called();
        });

        it('should fail on gem fetch error', async function() {
            const checkoutEventHandlerFields = [];

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
                consumed: false,
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
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: '{}',
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                ],
                current_action: 1,
                current_status: 'event:in progress',
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
                    gem_status: 'Complete',
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

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutEventHandlers.checkoutProgressHandler(
                checkoutEventHandlerFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.status).toEqual('event:error');
            expect(finalActionSet.action.error.error).toEqual('cannot_find_gem_order');

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: 'gem_order_id',
                    }),
                ),
            ).called();
        });

        it('should fail on gem iempty fetch error', async function() {
            const checkoutEventHandlerFields = [];

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
                consumed: false,
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
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'event',
                        name: '@checkout/progress',
                        data: '{}',
                        error: null,
                        status: 'in progress',
                        private: false,
                    },
                ],
                current_action: 1,
                current_status: 'event:in progress',
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
                    gem_status: 'Complete',
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

            const actionSet: ActionSet = new ActionSet().load(rawActionSet);

            const [
                finalActionSet,
                shouldUpdate,
            ] = await context.checkoutEventHandlers.checkoutProgressHandler(
                checkoutEventHandlerFields,
                actionSet,
                async () => {},
            );

            expect(shouldUpdate).toEqual(true);
            expect(finalActionSet.status).toEqual('event:error');
            expect(finalActionSet.action.error.error).toEqual('cannot_find_gem_order');

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
