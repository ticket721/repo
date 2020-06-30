import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { CurrenciesService } from '@lib/common/currencies/Currencies.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { CartInputHandlers } from '@app/worker/actionhandlers/cart/Cart.input.handlers';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import { CartAcsetbuilderHelper } from '@lib/common/cart/acset_builders/Cart.acsetbuilder.helper';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { TimeToolService } from '@lib/common/toolbox/Time.tool.service';

describe('Cart Input Handlers Spec', function() {
    const context: {
        cartInputHandlers: CartInputHandlers;
        actionSetsServiceMock: ActionSetsService;
        categoriesServiceMock: CategoriesService;
        currenciesServiceMock: CurrenciesService;
        configServiceMock: ConfigService;
        timeToolServiceMock: TimeToolService;
    } = {
        cartInputHandlers: null,
        actionSetsServiceMock: null,
        categoriesServiceMock: null,
        currenciesServiceMock: null,
        configServiceMock: null,
        timeToolServiceMock: null,
    };

    beforeEach(async function() {
        context.actionSetsServiceMock = mock(ActionSetsService);
        context.categoriesServiceMock = mock(CategoriesService);
        context.currenciesServiceMock = mock(CurrenciesService);
        context.configServiceMock = mock(ConfigService);
        context.timeToolServiceMock = mock(TimeToolService);

        when(context.timeToolServiceMock.now()).thenReturn(new Date(Date.now()));
        when(context.configServiceMock.get('CART_MAX_TICKET_PER_CART')).thenReturn('3');

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ActionSetsService,
                    useValue: instance(context.actionSetsServiceMock),
                },
                {
                    provide: CategoriesService,
                    useValue: instance(context.categoriesServiceMock),
                },
                {
                    provide: CurrenciesService,
                    useValue: instance(context.currenciesServiceMock),
                },
                {
                    provide: ConfigService,
                    useValue: instance(context.configServiceMock),
                },
                {
                    provide: TimeToolService,
                    useValue: instance(context.timeToolServiceMock),
                },
                CartInputHandlers,
            ],
        }).compile();

        context.cartInputHandlers = module.get<CartInputHandlers>(CartInputHandlers);
    });

    describe('ticketSelection', function() {
        it('should properly fulfill ticket selection step', async function() {
            const acsetbuilder = new CartAcsetbuilderHelper();
            const caller = {
                id: 'user_id',
            } as UserDto;

            const actionSetRes = await acsetbuilder.buildActionSet(caller, {});

            const actionSet = actionSetRes.response;

            actionSet.action.setData({
                tickets: [
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_id',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 0,
                            },
                        ],
                    } as CategoryEntity,
                ],
            });

            when(
                context.currenciesServiceMock.resolveInputPrices(
                    deepEqual([
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ]),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        currency: 'T721Token',
                        value: '100',
                        log_value: 0,
                    },
                ],
            });

            when(context.currenciesServiceMock.computeFee('T721Token', '100')).thenResolve('0');

            const handlerResult = await context.cartInputHandlers.ticketSelectionsHandler(
                context.cartInputHandlers.ticketSelectionsFields,
                actionSet,
                async () => {},
            );

            expect(handlerResult[0].raw).toEqual({
                name: '@cart/creation',
                consumed: false,
                dispatched_at: handlerResult[0].raw.dispatched_at,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data:
                            '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}],"total":[{"currency":"T721Token","value":"100","log_value":0}],"fees":["0"]}',
                        error: null,
                        status: 'complete',
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
                current_action: 1,
                current_status: 'input:in progress',
            });
            expect(handlerResult[1]).toEqual(true);

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).called();

            verify(
                context.currenciesServiceMock.resolveInputPrices(
                    deepEqual([
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ]),
                ),
            ).called();

            verify(context.currenciesServiceMock.computeFee('T721Token', '100')).called();
        });

        it('should properly fulfill ticket selection step for 3 tickets', async function() {
            const acsetbuilder = new CartAcsetbuilderHelper();
            const caller = {
                id: 'user_id',
            } as UserDto;

            const actionSetRes = await acsetbuilder.buildActionSet(caller, {});

            const actionSet = actionSetRes.response;

            actionSet.action.setData({
                tickets: [
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_id',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 0,
                            },
                        ],
                    } as CategoryEntity,
                ],
            });

            when(
                context.currenciesServiceMock.resolveInputPrices(
                    deepEqual([
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ]),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        currency: 'T721Token',
                        value: '100',
                        log_value: 0,
                    },
                ],
            });

            when(context.currenciesServiceMock.computeFee('T721Token', '300')).thenResolve('0');

            const handlerResult = await context.cartInputHandlers.ticketSelectionsHandler(
                context.cartInputHandlers.ticketSelectionsFields,
                actionSet,
                async () => {},
            );

            expect(handlerResult[0].raw).toEqual({
                name: '@cart/creation',
                consumed: false,
                dispatched_at: handlerResult[0].raw.dispatched_at,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data:
                            '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}},{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}},{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}],"total":[{"currency":"T721Token","value":"300","log_value":0}],"fees":["0"]}',
                        error: null,
                        status: 'complete',
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
                current_action: 1,
                current_status: 'input:in progress',
            });
            expect(handlerResult[1]).toEqual(true);

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).called();

            verify(
                context.currenciesServiceMock.resolveInputPrices(
                    deepEqual([
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ]),
                ),
            ).called();

            verify(context.currenciesServiceMock.computeFee('T721Token', '100')).called();
        });

        it('should fail on multi group id selection', async function() {
            const acsetbuilder = new CartAcsetbuilderHelper();
            const caller = {
                id: 'user_id',
            } as UserDto;

            const actionSetRes = await acsetbuilder.buildActionSet(caller, {});

            const actionSet = actionSetRes.response;

            actionSet.action.setData({
                tickets: [
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                    {
                        categoryId: 'category_id_two',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_id',
                        group_id: 'group_id',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 0,
                            },
                        ],
                    } as CategoryEntity,
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id_two',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_id_two',
                        group_id: 'group_id_two',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 0,
                            },
                        ],
                    } as CategoryEntity,
                ],
            });

            when(
                context.currenciesServiceMock.resolveInputPrices(
                    deepEqual([
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ]),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        currency: 'T721Token',
                        value: '100',
                        log_value: 0,
                    },
                ],
            });

            when(context.currenciesServiceMock.computeFee('T721Token', '300')).thenResolve('0');

            const handlerResult = await context.cartInputHandlers.ticketSelectionsHandler(
                context.cartInputHandlers.ticketSelectionsFields,
                actionSet,
                async () => {},
            );

            expect(handlerResult[0].raw).toEqual({
                name: '@cart/creation',
                consumed: false,
                dispatched_at: handlerResult[0].raw.dispatched_at,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data:
                            '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}},{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}},{"categoryId":"category_id_two","price":{"currency":"Fiat","price":"100"}}],"total":[{"currency":"T721Token","value":"300","log_value":0}],"fees":["0"]}',
                        error:
                            '{"details":{"group_id":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}},{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}],"group_id_two":[{"categoryId":"category_id_two","price":{"currency":"Fiat","price":"100"}}]},"error":"cannot_purchase_multiple_group_id"}',
                        status: 'error',
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
                current_status: 'input:error',
            });
            expect(handlerResult[1]).toEqual(true);

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).called();

            verify(
                context.currenciesServiceMock.resolveInputPrices(
                    deepEqual([
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ]),
                ),
            ).called();

            verify(context.currenciesServiceMock.computeFee('T721Token', '100')).called();
        });

        it('should fail on ticket purchase before sale start', async function() {
            const acsetbuilder = new CartAcsetbuilderHelper();
            const caller = {
                id: 'user_id',
            } as UserDto;

            const actionSetRes = await acsetbuilder.buildActionSet(caller, {});

            const actionSet = actionSetRes.response;

            const saleBegin = new Date(Date.now() + 60000);

            actionSet.action.setData({
                tickets: [
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_id',
                        group_id: 'group_id',
                        sale_begin: saleBegin,
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 0,
                            },
                        ],
                    } as CategoryEntity,
                ],
            });

            when(
                context.currenciesServiceMock.resolveInputPrices(
                    deepEqual([
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ]),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        currency: 'T721Token',
                        value: '100',
                        log_value: 0,
                    },
                ],
            });

            when(context.currenciesServiceMock.computeFee('T721Token', '300')).thenResolve('0');

            const handlerResult = await context.cartInputHandlers.ticketSelectionsHandler(
                context.cartInputHandlers.ticketSelectionsFields,
                actionSet,
                async () => {},
            );

            expect(handlerResult[0].raw).toEqual({
                name: '@cart/creation',
                consumed: false,
                dispatched_at: handlerResult[0].raw.dispatched_at,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: `{\"tickets\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"}},{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"}}],\"total\":[{\"currency\":\"T721Token\",\"value\":\"200\",\"log_value\":0}],\"fees\":[null]}`,
                        error: `{\"details\":[{\"category\":{\"id\":\"category_id\",\"group_id\":\"group_id\",\"sale_begin\":\"${saleBegin.toISOString()}\",\"prices\":[{\"currency\":\"T721Token\",\"value\":\"100\",\"log_value\":0}]},\"reason\":\"sale_not_started\"},{\"category\":{\"id\":\"category_id\",\"group_id\":\"group_id\",\"sale_begin\":\"${saleBegin.toISOString()}\",\"prices\":[{\"currency\":\"T721Token\",\"value\":\"100\",\"log_value\":0}]},\"reason\":\"sale_not_started\"}],\"error\":\"cannot_purchase_tickets\"}`,
                        status: 'error',
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
                current_status: 'input:error',
            });
            expect(handlerResult[1]).toEqual(true);

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).called();

            verify(
                context.currenciesServiceMock.resolveInputPrices(
                    deepEqual([
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ]),
                ),
            ).called();

            verify(context.currenciesServiceMock.computeFee('T721Token', '100')).called();
        });

        it('should fail on ticket purchase before sale end', async function() {
            const acsetbuilder = new CartAcsetbuilderHelper();
            const caller = {
                id: 'user_id',
            } as UserDto;

            const actionSetRes = await acsetbuilder.buildActionSet(caller, {});

            const actionSet = actionSetRes.response;

            const saleEnd = new Date(Date.now() - 60000);

            actionSet.action.setData({
                tickets: [
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_id',
                        group_id: 'group_id',
                        sale_end: saleEnd,
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 0,
                            },
                        ],
                    } as CategoryEntity,
                ],
            });

            when(
                context.currenciesServiceMock.resolveInputPrices(
                    deepEqual([
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ]),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        currency: 'T721Token',
                        value: '100',
                        log_value: 0,
                    },
                ],
            });

            when(context.currenciesServiceMock.computeFee('T721Token', '300')).thenResolve('0');

            const handlerResult = await context.cartInputHandlers.ticketSelectionsHandler(
                context.cartInputHandlers.ticketSelectionsFields,
                actionSet,
                async () => {},
            );

            expect(handlerResult[0].raw).toEqual({
                name: '@cart/creation',
                consumed: false,
                dispatched_at: handlerResult[0].raw.dispatched_at,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: `{\"tickets\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"}},{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"}}],\"total\":[{\"currency\":\"T721Token\",\"value\":\"200\",\"log_value\":0}],\"fees\":[null]}`,
                        error: `{\"details\":[{\"category\":{\"id\":\"category_id\",\"group_id\":\"group_id\",\"sale_end\":\"${saleEnd.toISOString()}\",\"prices\":[{\"currency\":\"T721Token\",\"value\":\"100\",\"log_value\":0}]},\"reason\":\"sale_ended\"},{\"category\":{\"id\":\"category_id\",\"group_id\":\"group_id\",\"sale_end\":\"${saleEnd.toISOString()}\",\"prices\":[{\"currency\":\"T721Token\",\"value\":\"100\",\"log_value\":0}]},\"reason\":\"sale_ended\"}],\"error\":\"cannot_purchase_tickets\"}`,
                        status: 'error',
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
                current_status: 'input:error',
            });
            expect(handlerResult[1]).toEqual(true);

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).called();

            verify(
                context.currenciesServiceMock.resolveInputPrices(
                    deepEqual([
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ]),
                ),
            ).called();

            verify(context.currenciesServiceMock.computeFee('T721Token', '100')).called();
        });

        it('should fail on too much elements in cart', async function() {
            const acsetbuilder = new CartAcsetbuilderHelper();
            const caller = {
                id: 'user_id',
            } as UserDto;

            const actionSetRes = await acsetbuilder.buildActionSet(caller, {});

            const actionSet = actionSetRes.response;

            actionSet.action.setData({
                tickets: [
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_id',
                        group_id: 'group_id',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 0,
                            },
                        ],
                    } as CategoryEntity,
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id_two',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_id_two',
                        group_id: 'group_id_two',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 0,
                            },
                        ],
                    } as CategoryEntity,
                ],
            });

            when(
                context.currenciesServiceMock.resolveInputPrices(
                    deepEqual([
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ]),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        currency: 'T721Token',
                        value: '100',
                        log_value: 0,
                    },
                ],
            });

            when(context.currenciesServiceMock.computeFee('T721Token', '300')).thenResolve('0');

            const handlerResult = await context.cartInputHandlers.ticketSelectionsHandler(
                context.cartInputHandlers.ticketSelectionsFields,
                actionSet,
                async () => {},
            );

            expect(handlerResult[0].raw).toEqual({
                name: '@cart/creation',
                consumed: false,
                dispatched_at: handlerResult[0].raw.dispatched_at,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data:
                            '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}},{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}},{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}},{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}},{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}},{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}],"total":[{"currency":"T721Token","value":"600","log_value":0}],"fees":[null]}',
                        error: '{"details":null,"error":"cart_too_big"}',
                        status: 'error',
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
                current_status: 'input:error',
            });
            expect(handlerResult[1]).toEqual(true);

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).called();

            verify(
                context.currenciesServiceMock.resolveInputPrices(
                    deepEqual([
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ]),
                ),
            ).called();

            verify(context.currenciesServiceMock.computeFee('T721Token', '100')).called();
        });

        it('should fail on invalid input', async function() {
            const acsetbuilder = new CartAcsetbuilderHelper();
            const caller = {
                id: 'user_id',
            } as UserDto;

            const actionSetRes = await acsetbuilder.buildActionSet(caller, {});

            const actionSet = actionSetRes.response;

            actionSet.action.setData({
                tickets: {
                    categoryId: 'category_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            });

            const handlerResult = await context.cartInputHandlers.ticketSelectionsHandler(
                context.cartInputHandlers.ticketSelectionsFields,
                actionSet,
                async () => {},
            );

            expect(handlerResult[0].raw).toEqual({
                name: '@cart/creation',
                consumed: false,
                dispatched_at: handlerResult[0].raw.dispatched_at,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{"tickets":{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}}',
                        error:
                            '{"details":{"_original":{"tickets":{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}},"details":[{"message":"\\"tickets\\" must be an array","path":["tickets"],"type":"array.base","context":{"label":"tickets","value":{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}},"key":"tickets"}}]},"error":"validation_error"}',
                        status: 'error',
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
                current_status: 'input:error',
            });
            expect(handlerResult[1]).toEqual(true);
        });

        it('should fail on missing mandatory field', async function() {
            const acsetbuilder = new CartAcsetbuilderHelper();
            const caller = {
                id: 'user_id',
            } as UserDto;

            const actionSetRes = await acsetbuilder.buildActionSet(caller, {});

            const actionSet = actionSetRes.response;

            actionSet.action.setData({});

            const handlerResult = await context.cartInputHandlers.ticketSelectionsHandler(
                context.cartInputHandlers.ticketSelectionsFields,
                actionSet,
                async () => {},
            );

            expect(handlerResult[0].raw).toEqual({
                name: '@cart/creation',
                consumed: false,
                dispatched_at: handlerResult[0].raw.dispatched_at,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{}',
                        error: '{"details":["tickets"],"error":"incomplete_error"}',
                        status: 'incomplete',
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
                current_status: 'input:incomplete',
            });
            expect(handlerResult[1]).toEqual(true);
        });

        it('should fail on category fetch error', async function() {
            const acsetbuilder = new CartAcsetbuilderHelper();
            const caller = {
                id: 'user_id',
            } as UserDto;

            const actionSetRes = await acsetbuilder.buildActionSet(caller, {});

            const actionSet = actionSetRes.response;

            actionSet.action.setData({
                tickets: [
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const handlerResult = await context.cartInputHandlers.ticketSelectionsHandler(
                context.cartInputHandlers.ticketSelectionsFields,
                actionSet,
                async () => {},
            );

            expect(handlerResult[0].raw).toEqual({
                name: '@cart/creation',
                consumed: false,
                dispatched_at: handlerResult[0].raw.dispatched_at,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}]}',
                        error: '{"details":null,"error":"unexpected_error"}',
                        status: 'error',
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
                current_status: 'input:error',
            });
            expect(handlerResult[1]).toEqual(true);

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).called();
        });

        it('should fail on empty category fetch', async function() {
            const acsetbuilder = new CartAcsetbuilderHelper();
            const caller = {
                id: 'user_id',
            } as UserDto;

            const actionSetRes = await acsetbuilder.buildActionSet(caller, {});

            const actionSet = actionSetRes.response;

            actionSet.action.setData({
                tickets: [
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            const handlerResult = await context.cartInputHandlers.ticketSelectionsHandler(
                context.cartInputHandlers.ticketSelectionsFields,
                actionSet,
                async () => {},
            );

            expect(handlerResult[0].raw).toEqual({
                name: '@cart/creation',
                consumed: false,
                dispatched_at: handlerResult[0].raw.dispatched_at,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}]}',
                        error: '{"details":null,"error":"category_not_found"}',
                        status: 'error',
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
                current_status: 'input:error',
            });
            expect(handlerResult[1]).toEqual(true);

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).called();
        });

        it('should fail on invalid prices not matching', async function() {
            const acsetbuilder = new CartAcsetbuilderHelper();
            const caller = {
                id: 'user_id',
            } as UserDto;

            const actionSetRes = await acsetbuilder.buildActionSet(caller, {});

            const actionSet = actionSetRes.response;

            actionSet.action.setData({
                tickets: [
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '101',
                        },
                    },
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_id',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 0,
                            },
                        ],
                    } as CategoryEntity,
                ],
            });

            when(
                context.currenciesServiceMock.resolveInputPrices(
                    deepEqual([
                        {
                            currency: 'Fiat',
                            price: '101',
                        },
                    ]),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        currency: 'T721Token',
                        value: '101',
                        log_value: 0,
                    },
                ],
            });

            const handlerResult = await context.cartInputHandlers.ticketSelectionsHandler(
                context.cartInputHandlers.ticketSelectionsFields,
                actionSet,
                async () => {},
            );

            expect(handlerResult[0].raw).toEqual({
                name: '@cart/creation',
                consumed: false,
                dispatched_at: handlerResult[0].raw.dispatched_at,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"101"}}]}',
                        error:
                            '{"details":[{"currency":"T721Token","value":"101","log_value":0}],"error":"price_not_matching"}',
                        status: 'error',
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
                current_status: 'input:error',
            });
            expect(handlerResult[1]).toEqual(true);

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).called();

            verify(
                context.currenciesServiceMock.resolveInputPrices(
                    deepEqual([
                        {
                            currency: 'Fiat',
                            price: '101',
                        },
                    ]),
                ),
            ).called();
        });

        it('should properly on currency resolution error', async function() {
            const acsetbuilder = new CartAcsetbuilderHelper();
            const caller = {
                id: 'user_id',
            } as UserDto;

            const actionSetRes = await acsetbuilder.buildActionSet(caller, {});

            const actionSet = actionSetRes.response;

            actionSet.action.setData({
                tickets: [
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_id',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 0,
                            },
                        ],
                    } as CategoryEntity,
                ],
            });

            when(
                context.currenciesServiceMock.resolveInputPrices(
                    deepEqual([
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ]),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const handlerResult = await context.cartInputHandlers.ticketSelectionsHandler(
                context.cartInputHandlers.ticketSelectionsFields,
                actionSet,
                async () => {},
            );

            expect(handlerResult[0].raw).toEqual({
                name: '@cart/creation',
                consumed: false,
                dispatched_at: handlerResult[0].raw.dispatched_at,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{"tickets":[{"categoryId":"category_id","price":{"currency":"Fiat","price":"100"}}]}',
                        error: '{"details":[],"error":"currency_resolution_error"}',
                        status: 'error',
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
                current_status: 'input:error',
            });
            expect(handlerResult[1]).toEqual(true);

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).called();

            verify(
                context.currenciesServiceMock.resolveInputPrices(
                    deepEqual([
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ]),
                ),
            ).called();
        });
    });

    describe('modulesConfiguration', function() {
        it('should properly fulfill module configurations step', async function() {
            const acsetbuilder = new CartAcsetbuilderHelper();
            const caller = {
                id: 'user_id',
            } as UserDto;

            const actionSetRes = await acsetbuilder.buildActionSet(caller, {});

            const actionSet = actionSetRes.response;

            actionSet.next();

            actionSet.action.setData({});

            const handlerResult = await context.cartInputHandlers.modulesConfigurationHandler(
                context.cartInputHandlers.modulesConfigurationFields,
                actionSet,
                async () => {},
            );

            expect(handlerResult[0].raw).toEqual({
                name: '@cart/creation',
                consumed: false,
                dispatched_at: handlerResult[0].raw.dispatched_at,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{}',
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/modulesConfiguration',
                        data: '{}',
                        error: null,
                        status: 'complete',
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
                current_action: 2,
                current_status: 'input:in progress',
            });
            expect(handlerResult[1]).toEqual(true);
        });

        it('should fail on invalid input', async function() {
            const acsetbuilder = new CartAcsetbuilderHelper();
            const caller = {
                id: 'user_id',
            } as UserDto;

            const actionSetRes = await acsetbuilder.buildActionSet(caller, {});

            const actionSet = actionSetRes.response;

            actionSet.next();

            actionSet.action.setData({
                field: 'that does not exist',
            });

            const handlerResult = await context.cartInputHandlers.modulesConfigurationHandler(
                context.cartInputHandlers.modulesConfigurationFields,
                actionSet,
                async () => {},
            );

            expect(handlerResult[0].raw).toEqual({
                name: '@cart/creation',
                consumed: false,
                dispatched_at: handlerResult[0].raw.dispatched_at,
                actions: [
                    {
                        type: 'input',
                        name: '@cart/ticketSelections',
                        data: '{}',
                        error: null,
                        status: 'complete',
                        private: false,
                    },
                    {
                        type: 'input',
                        name: '@cart/modulesConfiguration',
                        data: '{"field":"that does not exist"}',
                        error:
                            '{"details":{"_original":{"field":"that does not exist"},"details":[{"message":"\\"field\\" is not allowed","path":["field"],"type":"object.unknown","context":{"child":"field","label":"field","value":"that does not exist","key":"field"}}]},"error":"validation_error"}',
                        status: 'error',
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
                current_action: 1,
                current_status: 'input:error',
            });
            expect(handlerResult[1]).toEqual(true);
        });
    });

    describe('authorizations', function() {
        it('should properly fulfill authorizations step', async function() {
            const acsetbuilder = new CartAcsetbuilderHelper();
            const caller = {
                id: 'user_id',
            } as UserDto;

            const actionSetRes = await acsetbuilder.buildActionSet(caller, {});

            const actionSet = actionSetRes.response;

            actionSet.action.setData({
                tickets: [
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                ],
            });

            actionSet.next();
            actionSet.next();

            actionSet.action.setData({
                authorizations: [
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                        authorizationId: 'authorization_id',
                        groupId: 'group_id',
                        categoryName: 'category_name',
                        granter: 'granter',
                        grantee: 'grantee',
                        granterController: 'granter_controller',
                        expiration: new Date(Date.now()),
                    },
                ],
                commitType: 'stripe',
                fees: ['0'],
                total: [
                    {
                        currency: 'Fiat',
                        value: '100',
                        log_value: 0,
                    },
                ],
            });

            const handlerResult = await context.cartInputHandlers.authorizationsHandler(
                context.cartInputHandlers.authorizationsFields,
                actionSet,
                async () => {},
            );

            expect(handlerResult[0].raw).toEqual({
                name: '@cart/creation',
                consumed: false,
                dispatched_at: handlerResult[0].raw.dispatched_at,
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
                        data: `{\"authorizations\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"},\"authorizationId\":\"authorization_id\",\"groupId\":\"group_id\",\"categoryName\":\"category_name\",\"granter\":\"granter\",\"grantee\":\"grantee\",\"granterController\":\"granter_controller\",\"expiration\":\"${handlerResult[0].action.data.authorizations[0].expiration}\"}],\"commitType\":\"stripe\",\"fees\":[\"0\"],\"total\":[{\"currency\":\"Fiat\",\"value\":\"100\",\"log_value\":0}]}`,
                        error: null,
                        status: 'complete',
                        private: true,
                    },
                ],
                current_action: 2,
                current_status: 'complete',
            });
            expect(handlerResult[1]).toEqual(true);
        });

        it('should fail on invalid input', async function() {
            const acsetbuilder = new CartAcsetbuilderHelper();
            const caller = {
                id: 'user_id',
            } as UserDto;

            const actionSetRes = await acsetbuilder.buildActionSet(caller, {});

            const actionSet = actionSetRes.response;

            actionSet.action.setData({
                tickets: [
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                ],
            });

            actionSet.next();
            actionSet.next();

            actionSet.action.setData({
                extra: 'field',
                authorizations: [
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                        authorizationId: 'authorization_id',
                        groupId: 'group_id',
                        categoryName: 'category_name',
                        granter: 'granter',
                        grantee: 'grantee',
                        granterController: 'granter_controller',
                        expiration: new Date(Date.now()),
                    },
                ],
                commitType: 'stripe',
                fees: ['0'],
                total: [
                    {
                        currency: 'Fiat',
                        value: '100',
                        log_value: 0,
                    },
                ],
            });

            const handlerResult = await context.cartInputHandlers.authorizationsHandler(
                context.cartInputHandlers.authorizationsFields,
                actionSet,
                async () => {},
            );

            expect(handlerResult[0].raw).toEqual({
                name: '@cart/creation',
                consumed: false,
                dispatched_at: handlerResult[0].raw.dispatched_at,
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
                        data: `{\"extra\":\"field\",\"authorizations\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"},\"authorizationId\":\"authorization_id\",\"groupId\":\"group_id\",\"categoryName\":\"category_name\",\"granter\":\"granter\",\"grantee\":\"grantee\",\"granterController\":\"granter_controller\",\"expiration\":\"${handlerResult[0].action.data.authorizations[0].expiration}\"}],\"commitType\":\"stripe\",\"fees\":[\"0\"],\"total\":[{\"currency\":\"Fiat\",\"value\":\"100\",\"log_value\":0}]}`,
                        error: `{\"details\":{\"_original\":{\"extra\":\"field\",\"authorizations\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"100\"},\"authorizationId\":\"authorization_id\",\"groupId\":\"group_id\",\"categoryName\":\"category_name\",\"granter\":\"granter\",\"grantee\":\"grantee\",\"granterController\":\"granter_controller\",\"expiration\":\"${handlerResult[0].action.data.authorizations[0].expiration}\"}],\"commitType\":\"stripe\",\"fees\":[\"0\"],\"total\":[{\"currency\":\"Fiat\",\"value\":\"100\",\"log_value\":0}]},\"details\":[{\"message\":\"\\\"extra\\\" is not allowed\",\"path\":[\"extra\"],\"type\":\"object.unknown\",\"context\":{\"child\":\"extra\",\"label\":\"extra\",\"value\":\"field\",\"key\":\"extra\"}}]},\"error\":\"validation_error\"}`,
                        status: 'error',
                        private: true,
                    },
                ],
                current_action: 2,
                current_status: 'input:error',
            });
            expect(handlerResult[1]).toEqual(true);
        });

        it('should fail on incomplete error', async function() {
            const acsetbuilder = new CartAcsetbuilderHelper();
            const caller = {
                id: 'user_id',
            } as UserDto;

            const actionSetRes = await acsetbuilder.buildActionSet(caller, {});

            const actionSet = actionSetRes.response;

            actionSet.action.setData({
                tickets: [
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                ],
            });

            actionSet.next();
            actionSet.next();

            actionSet.action.setData({
                commitType: 'stripe',
                total: [
                    {
                        currency: 'Fiat',
                        value: '100',
                        log_value: 0,
                    },
                ],
                fees: ['0'],
            });

            const handlerResult = await context.cartInputHandlers.authorizationsHandler(
                context.cartInputHandlers.authorizationsFields,
                actionSet,
                async () => {},
            );

            expect(handlerResult[0].raw).toEqual({
                name: '@cart/creation',
                consumed: false,
                dispatched_at: handlerResult[0].raw.dispatched_at,
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
                        data:
                            '{"commitType":"stripe","total":[{"currency":"Fiat","value":"100","log_value":0}],"fees":["0"]}',
                        error: '{"details":["authorizations"],"error":"incomplete_error"}',
                        status: 'incomplete',
                        private: true,
                    },
                ],
                current_action: 2,
                current_status: 'input:incomplete',
            });
            expect(handlerResult[1]).toEqual(true);
        });

        it('should fail on tickets mismatch', async function() {
            const acsetbuilder = new CartAcsetbuilderHelper();
            const caller = {
                id: 'user_id',
            } as UserDto;

            const actionSetRes = await acsetbuilder.buildActionSet(caller, {});

            const actionSet = actionSetRes.response;

            actionSet.action.setData({
                tickets: [
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '100',
                        },
                    },
                ],
            });

            actionSet.next();
            actionSet.next();

            actionSet.action.setData({
                authorizations: [
                    {
                        categoryId: 'category_id',
                        price: {
                            currency: 'Fiat',
                            price: '101',
                        },
                        authorizationId: 'authorization_id',
                        groupId: 'group_id',
                        categoryName: 'category_name',
                        granter: 'granter',
                        grantee: 'grantee',
                        granterController: 'granter_controller',
                        expiration: new Date(Date.now()),
                    },
                ],
                commitType: 'stripe',
                fees: ['0'],
                total: [
                    {
                        currency: 'Fiat',
                        value: '101',
                        log_value: 0,
                    },
                ],
            });

            const handlerResult = await context.cartInputHandlers.authorizationsHandler(
                context.cartInputHandlers.authorizationsFields,
                actionSet,
                async () => {},
            );

            expect(handlerResult[0].raw).toEqual({
                name: '@cart/creation',
                consumed: false,
                dispatched_at: handlerResult[0].raw.dispatched_at,
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
                        data: `{\"authorizations\":[{\"categoryId\":\"category_id\",\"price\":{\"currency\":\"Fiat\",\"price\":\"101\"},\"authorizationId\":\"authorization_id\",\"groupId\":\"group_id\",\"categoryName\":\"category_name\",\"granter\":\"granter\",\"grantee\":\"grantee\",\"granterController\":\"granter_controller\",\"expiration\":\"${handlerResult[0].action.data.authorizations[0].expiration}\"}],\"commitType\":\"stripe\",\"fees\":[\"0\"],\"total\":[{\"currency\":\"Fiat\",\"value\":\"101\",\"log_value\":0}]}`,
                        error: '{"error":"authorizations_not_matching"}',
                        status: 'error',
                        private: true,
                    },
                ],
                current_action: 2,
                current_status: 'input:error',
            });
            expect(handlerResult[1]).toEqual(true);
        });
    });
});
