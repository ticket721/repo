import { getQueueToken, InjectQueue } from '@nestjs/bull';
import { Job, JobOptions, Queue } from 'bull';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { T721TokenService } from '@lib/common/contracts/T721Token.service';
import { T721AdminService } from '@lib/common/contracts/T721Admin.service';
import { TicketforgeService } from '@lib/common/contracts/Ticketforge.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { CurrenciesService, ERC20Currency, InputPrice, Price } from '@lib/common/currencies/Currencies.service';
import { AuthorizationsService } from '@lib/common/authorizations/Authorizations.service';
import { UsersService } from '@lib/common/users/Users.service';
import { GroupService } from '@lib/common/group/Group.service';
import { TicketsService } from '@lib/common/tickets/Tickets.service';
import {
    MintingTasks,
    TicketMintingTransactionFailure,
    TicketMintingTransactionSequenceBuilderTaskInput,
} from '@app/worker/tasks/minting/Minting.tasks';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test } from '@nestjs/testing';
import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';
import {
    ActionEntity,
    ActionSetEntity,
    ActionStatus,
    ActionType,
} from '@lib/common/actionsets/entities/ActionSet.entity';
import { CheckoutResolve } from '@app/worker/actionhandlers/checkout/Checkout.input.handlers';
import { CartAuthorizations } from '@app/worker/actionhandlers/cart/Cart.input.handlers';
import { AuthorizedTicketMintingFormat } from '@lib/common/utils/Cart.type';
import { DAY } from '@lib/common/utils/time';
import { AuthorizationEntity } from '@lib/common/authorizations/entities/Authorization.entity';
import { MintAuthorization, toB32 } from '@common/global';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { NestError } from '@lib/common/utils/NestError';

class QueueMock<T = any> {
    add(name: string, data: T, opts?: JobOptions): Promise<Job<T>> {
        return null;
    }
}

describe('Minting Tasks', function() {
    const context: {
        mintingTasks: MintingTasks;
        mintingQueueMock: QueueMock;
        txQueueMock: QueueMock;
        outrospectionServiceMock: OutrospectionService;
        shutdownServiceMock: ShutdownService;
        actionSetsServiceMock: ActionSetsService;
        t721TokenServiceMock: T721TokenService;
        t721AdminServiceMock: T721AdminService;
        ticketforgeServiceMock: TicketforgeService;
        configServiceMock: ConfigService;
        currenciesServiceMock: CurrenciesService;
        authorizationsServiceMock: AuthorizationsService;
        usersServiceMock: UsersService;
        groupServiceMock: GroupService;
        ticketsServiceMock: TicketsService;
    } = {
        mintingTasks: null,
        mintingQueueMock: null,
        txQueueMock: null,
        outrospectionServiceMock: null,
        shutdownServiceMock: null,
        actionSetsServiceMock: null,
        t721TokenServiceMock: null,
        t721AdminServiceMock: null,
        ticketforgeServiceMock: null,
        configServiceMock: null,
        currenciesServiceMock: null,
        authorizationsServiceMock: null,
        usersServiceMock: null,
        groupServiceMock: null,
        ticketsServiceMock: null,
    };

    beforeEach(async function() {
        context.mintingQueueMock = mock(QueueMock);
        context.txQueueMock = mock(QueueMock);
        context.outrospectionServiceMock = mock(OutrospectionService);
        context.shutdownServiceMock = mock(ShutdownService);
        context.actionSetsServiceMock = mock(ActionSetsService);
        context.t721TokenServiceMock = mock(T721TokenService);
        context.t721AdminServiceMock = mock(T721AdminService);
        context.ticketforgeServiceMock = mock(TicketforgeService);
        context.configServiceMock = mock(ConfigService);
        context.currenciesServiceMock = mock(CurrenciesService);
        context.authorizationsServiceMock = mock(AuthorizationsService);
        context.usersServiceMock = mock(UsersService);
        context.groupServiceMock = mock(GroupService);
        context.ticketsServiceMock = mock(TicketsService);

        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: getQueueToken('minting'),
                    useValue: instance(context.mintingQueueMock),
                },
                {
                    provide: getQueueToken('tx'),
                    useValue: instance(context.txQueueMock),
                },
                {
                    provide: OutrospectionService,
                    useValue: instance(context.outrospectionServiceMock),
                },
                {
                    provide: ShutdownService,
                    useValue: instance(context.shutdownServiceMock),
                },
                {
                    provide: ActionSetsService,
                    useValue: instance(context.actionSetsServiceMock),
                },
                {
                    provide: T721TokenService,
                    useValue: instance(context.t721TokenServiceMock),
                },
                {
                    provide: T721AdminService,
                    useValue: instance(context.t721AdminServiceMock),
                },
                {
                    provide: TicketforgeService,
                    useValue: instance(context.ticketforgeServiceMock),
                },
                {
                    provide: ConfigService,
                    useValue: instance(context.configServiceMock),
                },
                {
                    provide: CurrenciesService,
                    useValue: instance(context.currenciesServiceMock),
                },
                {
                    provide: AuthorizationsService,
                    useValue: instance(context.authorizationsServiceMock),
                },
                {
                    provide: UsersService,
                    useValue: instance(context.usersServiceMock),
                },
                {
                    provide: GroupService,
                    useValue: instance(context.groupServiceMock),
                },
                {
                    provide: TicketsService,
                    useValue: instance(context.ticketsServiceMock),
                },
                MintingTasks,
            ],
        }).compile();

        context.mintingTasks = app.get<MintingTasks>(MintingTasks);
    });

    describe('ticketMintingTransactionSequenceBuilderTask', function() {
        it('should properly mix everything to get the transaction built and sent to the tx sequence queue', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const t721ControllerAddress = '0x36928500Bc1dCd7af6a2B4008875CC336b927D57';
            const t721TokenAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const t721AdminAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const gemOrderId = 'gem_order_id';
            const buyerId = 'user_id';
            const buyer: UserDto = {
                id: buyerId,
                address: buyerAddress,
            } as UserDto;
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const mintingEncoded = '0xencodedminting';
            const t721cInstance = {
                _address: t721ControllerAddress,
                methods: {
                    mint: () => ({
                        encodeABI: () => mintingEncoded,
                    }),
                },
            };
            const t721AdminInstance = {
                _address: t721AdminAddress,
            };
            const t721c = mock(ContractsControllerBase);
            const mmInstance = {
                methods: {},
            };
            const approveEncoded = '0xencodedapprove';
            const t721tokenInstance = {
                _address: t721TokenAddress,
                methods: {
                    allowance: () => ({
                        call: () => '0',
                    }),
                    approve: () => ({
                        encodeABI: () => approveEncoded,
                    }),
                },
            };
            const mm = mock(ContractsControllerBase);
            const ticketForgeInstance = {
                methods: {
                    getScope: () => ({
                        call: () => ({
                            exists: true,
                            scope_index: 0,
                        }),
                    }),
                },
            };
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const t721CurrencyERC20: ERC20Currency = {
                type: 'erc20',
                name: 'T721Token',
                module: 't721',
                address: t721TokenAddress,
                dollarPeg: 1,
                controller: instance(context.t721TokenServiceMock),
                feeComputer: () => '0',
            };
            const code = '12345';
            const authorizationOne: Partial<AuthorizationEntity> = {
                id: authorizationOneId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expiration.getTime() / 1000),
                ),
            };
            const ticketsPredictionInput = [
                {
                    buyer: buyerAddress,
                    categoryId: categoryOneId,
                    authorizationId: authorizationOneId,
                    groupId: groupId,
                },
            ];
            const ticketsPredictionOutput = [
                {
                    id: '181927450982374509823745',
                    owner: buyerAddress,
                } as TicketEntity,
            ];
            const transactions = [
                {
                    from: buyerAddress,
                    to: t721TokenAddress,
                    data: approveEncoded,
                    value: '0',
                },
                {
                    from: buyerAddress,
                    to: t721ControllerAddress,
                    data: mintingEncoded,
                    value: '0',
                    onConfirm: {
                        name: '@minting/confirmation',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                    onFailure: {
                        name: '@minting/failure',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                },
            ];

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [checkoutActionSet as ActionSetEntity],
            });
            // => evaluateTokenAmountToAuthorize
            when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);
            // => getTokenAuthorizationPayload
            when(t721c.get()).thenResolve(t721cInstance);
            // => generateTicketMintingTransactions
            when(context.currenciesServiceMock.get('T721Token')).thenResolve(t721CurrencyERC20);
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationOne as AuthorizationEntity],
            });
            when(context.t721AdminServiceMock.get()).thenResolve(t721AdminInstance);
            when(context.ticketforgeServiceMock.get()).thenResolve(ticketForgeInstance);
            when(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).thenResolve({
                error: null,
                response: [controllerAddress],
            });
            // => generateTickets
            when(context.ticketsServiceMock.predictTickets(deepEqual(ticketsPredictionInput))).thenResolve({
                error: null,
                response: ticketsPredictionOutput,
            });
            // <= ticketMintingTransactionSequenceBuilderTask
            when(context.usersServiceMock.findByAddress(buyerAddress)).thenResolve({
                error: null,
                response: buyer,
            });
            // => setAuthorizationsToDispatched
            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        dispatched: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });
            // <= ticketMintingTransactionSequenceBuilderTask
            when(
                context.actionSetsServiceMock.build(
                    'txseq_processor',
                    deepEqual(buyer),
                    deepEqual({
                        transactions,
                    }),
                    true,
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            // TRIGGER
            await context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                data: input,
            } as Job<TicketMintingTransactionSequenceBuilderTaskInput>);

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).twice();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
            // => evaluateTokenAmountToAuthorize
            verify(context.t721TokenServiceMock.get()).times(3);
            // => getTokenAuthorizationPayload
            verify(t721c.get()).times(4);
            // => generateTicketMintingTransactions
            verify(context.currenciesServiceMock.get('T721Token')).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
            verify(context.t721AdminServiceMock.get()).once();
            verify(context.ticketforgeServiceMock.get()).once();
            verify(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).once();
            // => generateTickets
            verify(context.ticketsServiceMock.predictTickets(deepEqual(ticketsPredictionInput))).once();
            // <= ticketMintingTransactionSequenceBuilderTask
            verify(context.usersServiceMock.findByAddress(buyerAddress)).once();
            // => setAuthorizationsToDispatched
            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        dispatched: true,
                    }),
                ),
            ).once();
            // <= ticketMintingTransactionSequenceBuilderTask
            verify(
                context.actionSetsServiceMock.build(
                    'txseq_processor',
                    deepEqual(buyer),
                    deepEqual({
                        transactions,
                    }),
                    true,
                ),
            ).once();
        });

        it('should properly behave on multiple authorizations', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const t721ControllerAddress = '0x36928500Bc1dCd7af6a2B4008875CC336b927D57';
            const t721TokenAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const t721AdminAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const gemOrderId = 'gem_order_id';
            const buyerId = 'user_id';
            const buyer: UserDto = {
                id: buyerId,
                address: buyerAddress,
            } as UserDto;
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const mintingEncoded = '0xencodedminting';
            const t721cInstance = {
                _address: t721ControllerAddress,
                methods: {
                    mint: () => ({
                        encodeABI: () => mintingEncoded,
                    }),
                },
            };
            const t721AdminInstance = {
                _address: t721AdminAddress,
            };
            const t721c = mock(ContractsControllerBase);
            const mmInstance = {
                methods: {},
            };
            const approveEncoded = '0xencodedapprove';
            const t721tokenInstance = {
                _address: t721TokenAddress,
                methods: {
                    allowance: () => ({
                        call: () => '0',
                    }),
                    approve: () => ({
                        encodeABI: () => approveEncoded,
                    }),
                },
            };
            const mm = mock(ContractsControllerBase);
            const ticketForgeInstance = {
                methods: {
                    getScope: () => ({
                        call: () => ({
                            exists: true,
                            scope_index: 0,
                        }),
                    }),
                },
            };
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const authorizationTwoId = 'authorization_two_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationTwoId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const t721CurrencyERC20: ERC20Currency = {
                type: 'erc20',
                name: 'T721Token',
                module: 't721',
                address: t721TokenAddress,
                dollarPeg: 1,
                controller: instance(context.t721TokenServiceMock),
                feeComputer: () => '0',
            };
            const code = '12345';
            const authorizationTwo: Partial<AuthorizationEntity> = {
                id: authorizationTwoId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expiration.getTime() / 1000),
                ),
            };
            const authorizationOne: Partial<AuthorizationEntity> = {
                id: authorizationOneId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expiration.getTime() / 1000),
                ),
            };
            const ticketsPredictionInput = [
                {
                    buyer: buyerAddress,
                    categoryId: categoryOneId,
                    authorizationId: authorizationOneId,
                    groupId: groupId,
                },
                {
                    buyer: buyerAddress,
                    categoryId: categoryOneId,
                    authorizationId: authorizationTwoId,
                    groupId: groupId,
                },
            ];
            const ticketsPredictionOutput = [
                {
                    id: '181927450982374509823745',
                    owner: buyerAddress,
                } as TicketEntity,
                {
                    id: '181927450982374509823746',
                    owner: buyerAddress,
                } as TicketEntity,
            ];
            const transactions = [
                {
                    from: buyerAddress,
                    to: t721TokenAddress,
                    data: approveEncoded,
                    value: '0',
                },
                {
                    from: buyerAddress,
                    to: t721ControllerAddress,
                    data: mintingEncoded,
                    value: '0',
                    onConfirm: {
                        name: '@minting/confirmation',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                    onFailure: {
                        name: '@minting/failure',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                },
            ];

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [checkoutActionSet as ActionSetEntity],
            });
            // => evaluateTokenAmountToAuthorize
            when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);
            // => getTokenAuthorizationPayload
            when(t721c.get()).thenResolve(t721cInstance);
            // => generateTicketMintingTransactions
            when(context.currenciesServiceMock.get('T721Token')).thenResolve(t721CurrencyERC20);
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationOne as AuthorizationEntity],
            });
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationTwoId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationTwo as AuthorizationEntity],
            });
            when(context.t721AdminServiceMock.get()).thenResolve(t721AdminInstance);
            when(context.ticketforgeServiceMock.get()).thenResolve(ticketForgeInstance);
            when(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).thenResolve({
                error: null,
                response: [controllerAddress],
            });
            // => generateTickets
            when(context.ticketsServiceMock.predictTickets(deepEqual(ticketsPredictionInput))).thenResolve({
                error: null,
                response: ticketsPredictionOutput,
            });
            // <= ticketMintingTransactionSequenceBuilderTask
            when(context.usersServiceMock.findByAddress(buyerAddress)).thenResolve({
                error: null,
                response: buyer,
            });
            // => setAuthorizationsToDispatched
            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        dispatched: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });
            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationTwoId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        dispatched: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });
            // <= ticketMintingTransactionSequenceBuilderTask
            when(
                context.actionSetsServiceMock.build(
                    'txseq_processor',
                    deepEqual(buyer),
                    deepEqual({
                        transactions,
                    }),
                    true,
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            // TRIGGER
            await context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                data: input,
            } as Job<TicketMintingTransactionSequenceBuilderTaskInput>);

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).twice();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
            // => evaluateTokenAmountToAuthorize
            verify(context.t721TokenServiceMock.get()).times(3);
            // => getTokenAuthorizationPayload
            verify(t721c.get()).times(4);
            // => generateTicketMintingTransactions
            verify(context.currenciesServiceMock.get('T721Token')).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationTwoId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
            verify(context.t721AdminServiceMock.get()).once();
            verify(context.ticketforgeServiceMock.get()).once();
            verify(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).once();
            // => generateTickets
            verify(context.ticketsServiceMock.predictTickets(deepEqual(ticketsPredictionInput))).once();
            // <= ticketMintingTransactionSequenceBuilderTask
            verify(context.usersServiceMock.findByAddress(buyerAddress)).once();
            // => setAuthorizationsToDispatched
            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        dispatched: true,
                    }),
                ),
            ).once();
            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationTwoId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        dispatched: true,
                    }),
                ),
            ).once();
            // <= ticketMintingTransactionSequenceBuilderTask
            verify(
                context.actionSetsServiceMock.build(
                    'txseq_processor',
                    deepEqual(buyer),
                    deepEqual({
                        transactions,
                    }),
                    true,
                ),
            ).once();
        });

        it('should properly behave on overly authorized amount', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const t721ControllerAddress = '0x36928500Bc1dCd7af6a2B4008875CC336b927D57';
            const t721TokenAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const t721AdminAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const gemOrderId = 'gem_order_id';
            const buyerId = 'user_id';
            const buyer: UserDto = {
                id: buyerId,
                address: buyerAddress,
            } as UserDto;
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const mintingEncoded = '0xencodedminting';
            const t721cInstance = {
                _address: t721ControllerAddress,
                methods: {
                    mint: () => ({
                        encodeABI: () => mintingEncoded,
                    }),
                },
            };
            const t721AdminInstance = {
                _address: t721AdminAddress,
            };
            const t721c = mock(ContractsControllerBase);
            const mmInstance = {
                methods: {},
            };
            const approveEncoded = '0xencodedapprove';
            const t721tokenInstance = {
                _address: t721TokenAddress,
                methods: {
                    allowance: () => ({
                        call: () => '10000000',
                    }),
                    approve: () => ({
                        encodeABI: () => approveEncoded,
                    }),
                },
            };
            const mm = mock(ContractsControllerBase);
            const ticketForgeInstance = {
                methods: {
                    getScope: () => ({
                        call: () => ({
                            exists: true,
                            scope_index: 0,
                        }),
                    }),
                },
            };
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const t721CurrencyERC20: ERC20Currency = {
                type: 'erc20',
                name: 'T721Token',
                module: 't721',
                address: t721TokenAddress,
                dollarPeg: 1,
                controller: instance(context.t721TokenServiceMock),
                feeComputer: () => '0',
            };
            const code = '12345';
            const authorizationOne: Partial<AuthorizationEntity> = {
                id: authorizationOneId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expiration.getTime() / 1000),
                ),
            };
            const ticketsPredictionInput = [
                {
                    buyer: buyerAddress,
                    categoryId: categoryOneId,
                    authorizationId: authorizationOneId,
                    groupId: groupId,
                },
            ];
            const ticketsPredictionOutput = [
                {
                    id: '181927450982374509823745',
                    owner: buyerAddress,
                } as TicketEntity,
            ];
            const transactions = [
                {
                    from: buyerAddress,
                    to: t721TokenAddress,
                    data: approveEncoded,
                    value: '0',
                },
                {
                    from: buyerAddress,
                    to: t721ControllerAddress,
                    data: mintingEncoded,
                    value: '0',
                    onConfirm: {
                        name: '@minting/confirmation',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                    onFailure: {
                        name: '@minting/failure',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                },
            ];

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [checkoutActionSet as ActionSetEntity],
            });
            // => evaluateTokenAmountToAuthorize
            when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);
            // => getTokenAuthorizationPayload
            when(t721c.get()).thenResolve(t721cInstance);
            // => generateTicketMintingTransactions
            when(context.currenciesServiceMock.get('T721Token')).thenResolve(t721CurrencyERC20);
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationOne as AuthorizationEntity],
            });
            when(context.t721AdminServiceMock.get()).thenResolve(t721AdminInstance);
            when(context.ticketforgeServiceMock.get()).thenResolve(ticketForgeInstance);
            when(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).thenResolve({
                error: null,
                response: [controllerAddress],
            });
            // => generateTickets
            when(context.ticketsServiceMock.predictTickets(deepEqual(ticketsPredictionInput))).thenResolve({
                error: null,
                response: ticketsPredictionOutput,
            });
            // <= ticketMintingTransactionSequenceBuilderTask
            when(context.usersServiceMock.findByAddress(buyerAddress)).thenResolve({
                error: null,
                response: buyer,
            });
            // => setAuthorizationsToDispatched
            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        dispatched: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });
            // <= ticketMintingTransactionSequenceBuilderTask
            when(
                context.actionSetsServiceMock.build(
                    'txseq_processor',
                    deepEqual(buyer),
                    deepEqual({
                        transactions,
                    }),
                    true,
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            // TRIGGER
            await context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                data: input,
            } as Job<TicketMintingTransactionSequenceBuilderTaskInput>);

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).twice();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
            // => evaluateTokenAmountToAuthorize
            verify(context.t721TokenServiceMock.get()).times(3);
            // => getTokenAuthorizationPayload
            verify(t721c.get()).times(4);
            // => generateTicketMintingTransactions
            verify(context.currenciesServiceMock.get('T721Token')).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
            verify(context.t721AdminServiceMock.get()).once();
            verify(context.ticketforgeServiceMock.get()).once();
            verify(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).once();
            // => generateTickets
            verify(context.ticketsServiceMock.predictTickets(deepEqual(ticketsPredictionInput))).once();
            // <= ticketMintingTransactionSequenceBuilderTask
            verify(context.usersServiceMock.findByAddress(buyerAddress)).once();
            // => setAuthorizationsToDispatched
            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        dispatched: true,
                    }),
                ),
            ).once();
            // <= ticketMintingTransactionSequenceBuilderTask
            verify(
                context.actionSetsServiceMock.build(
                    'txseq_processor',
                    deepEqual(buyer),
                    deepEqual({
                        transactions,
                    }),
                    true,
                ),
            ).once();
        });

        it('should properly behave on empty total length', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const t721ControllerAddress = '0x36928500Bc1dCd7af6a2B4008875CC336b927D57';
            const t721TokenAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const t721AdminAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const gemOrderId = 'gem_order_id';
            const buyerId = 'user_id';
            const buyer: UserDto = {
                id: buyerId,
                address: buyerAddress,
            } as UserDto;
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const mintingEncoded = '0xencodedminting';
            const t721cInstance = {
                _address: t721ControllerAddress,
                methods: {
                    mint: () => ({
                        encodeABI: () => mintingEncoded,
                    }),
                },
            };
            const t721AdminInstance = {
                _address: t721AdminAddress,
            };
            const t721c = mock(ContractsControllerBase);
            const approveEncoded = '0xencodedapprove';
            const t721tokenInstance = {
                _address: t721TokenAddress,
                methods: {
                    allowance: () => ({
                        call: () => '0',
                    }),
                    approve: () => ({
                        encodeABI: () => approveEncoded,
                    }),
                },
            };
            const mm = mock(ContractsControllerBase);
            const ticketForgeInstance = {
                methods: {
                    getScope: () => ({
                        call: () => ({
                            exists: true,
                            scope_index: 0,
                        }),
                    }),
                },
            };
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: null,
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const code = '12345';
            const authorizationOne: Partial<AuthorizationEntity> = {
                id: authorizationOneId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expiration.getTime() / 1000),
                ),
            };
            const ticketsPredictionInput = [
                {
                    buyer: buyerAddress,
                    categoryId: categoryOneId,
                    authorizationId: authorizationOneId,
                    groupId: groupId,
                },
            ];
            const ticketsPredictionOutput = [
                {
                    id: '181927450982374509823745',
                    owner: buyerAddress,
                } as TicketEntity,
            ];
            const transactions = [
                {
                    from: buyerAddress,
                    to: t721TokenAddress,
                    data: approveEncoded,
                    value: '0',
                },
                {
                    from: buyerAddress,
                    to: t721ControllerAddress,
                    data: mintingEncoded,
                    value: '0',
                    onConfirm: {
                        name: '@minting/confirmation',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                    onFailure: {
                        name: '@minting/failure',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                },
            ];

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [checkoutActionSet as ActionSetEntity],
            });
            // => evaluateTokenAmountToAuthorize
            when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);
            // => getTokenAuthorizationPayload
            when(t721c.get()).thenResolve(t721cInstance);
            // => generateTicketMintingTransactions
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationOne as AuthorizationEntity],
            });
            when(context.t721AdminServiceMock.get()).thenResolve(t721AdminInstance);
            when(context.ticketforgeServiceMock.get()).thenResolve(ticketForgeInstance);
            when(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).thenResolve({
                error: null,
                response: [controllerAddress],
            });
            // => generateTickets
            when(context.ticketsServiceMock.predictTickets(deepEqual(ticketsPredictionInput))).thenResolve({
                error: null,
                response: ticketsPredictionOutput,
            });
            // <= ticketMintingTransactionSequenceBuilderTask
            when(context.usersServiceMock.findByAddress(buyerAddress)).thenResolve({
                error: null,
                response: buyer,
            });
            // => setAuthorizationsToDispatched
            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        dispatched: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });
            // <= ticketMintingTransactionSequenceBuilderTask
            when(
                context.actionSetsServiceMock.build(
                    'txseq_processor',
                    deepEqual(buyer),
                    deepEqual({
                        transactions,
                    }),
                    true,
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            // TRIGGER
            await context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                data: input,
            } as Job<TicketMintingTransactionSequenceBuilderTaskInput>);

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).twice();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
            // => evaluateTokenAmountToAuthorize
            verify(context.t721TokenServiceMock.get()).times(2);
            // => getTokenAuthorizationPayload
            verify(t721c.get()).times(4);
            // => generateTicketMintingTransactions
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
            verify(context.t721AdminServiceMock.get()).once();
            verify(context.ticketforgeServiceMock.get()).once();
            verify(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).once();
            // => generateTickets
            verify(context.ticketsServiceMock.predictTickets(deepEqual(ticketsPredictionInput))).once();
            // <= ticketMintingTransactionSequenceBuilderTask
            verify(context.usersServiceMock.findByAddress(buyerAddress)).once();
            // => setAuthorizationsToDispatched
            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        dispatched: true,
                    }),
                ),
            ).once();
            // <= ticketMintingTransactionSequenceBuilderTask
            verify(
                context.actionSetsServiceMock.build(
                    'txseq_processor',
                    deepEqual(buyer),
                    deepEqual({
                        transactions,
                    }),
                    true,
                ),
            ).once();
        });

        it('should fail on multiple currencies in total', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const t721ControllerAddress = '0x36928500Bc1dCd7af6a2B4008875CC336b927D57';
            const t721TokenAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const t721AdminAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const gemOrderId = 'gem_order_id';
            const buyerId = 'user_id';
            const buyer: UserDto = {
                id: buyerId,
                address: buyerAddress,
            } as UserDto;
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const mintingEncoded = '0xencodedminting';
            const t721cInstance = {
                _address: t721ControllerAddress,
                methods: {
                    mint: () => ({
                        encodeABI: () => mintingEncoded,
                    }),
                },
            };
            const t721AdminInstance = {
                _address: t721AdminAddress,
            };
            const t721c = mock(ContractsControllerBase);
            const mmInstance = {
                methods: {},
            };
            const approveEncoded = '0xencodedapprove';
            const t721tokenInstance = {
                _address: t721TokenAddress,
                methods: {
                    allowance: () => ({
                        call: () => '0',
                    }),
                    approve: () => ({
                        encodeABI: () => approveEncoded,
                    }),
                },
            };
            const mm = mock(ContractsControllerBase);
            const ticketForgeInstance = {
                methods: {
                    getScope: () => ({
                        call: () => ({
                            exists: true,
                            scope_index: 0,
                        }),
                    }),
                },
            };
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [price, price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const t721CurrencyERC20: ERC20Currency = {
                type: 'erc20',
                name: 'T721Token',
                module: 't721',
                address: t721TokenAddress,
                dollarPeg: 1,
                controller: instance(context.t721TokenServiceMock),
                feeComputer: () => '0',
            };
            const code = '12345';
            const authorizationOne: Partial<AuthorizationEntity> = {
                id: authorizationOneId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expiration.getTime() / 1000),
                ),
            };
            const ticketsPredictionInput = [
                {
                    buyer: buyerAddress,
                    categoryId: categoryOneId,
                    authorizationId: authorizationOneId,
                    groupId: groupId,
                },
            ];
            const ticketsPredictionOutput = [
                {
                    id: '181927450982374509823745',
                    owner: buyerAddress,
                } as TicketEntity,
            ];
            const transactions = [
                {
                    from: buyerAddress,
                    to: t721TokenAddress,
                    data: approveEncoded,
                    value: '0',
                },
                {
                    from: buyerAddress,
                    to: t721ControllerAddress,
                    data: mintingEncoded,
                    value: '0',
                    onConfirm: {
                        name: '@minting/confirmation',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                    onFailure: {
                        name: '@minting/failure',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                },
            ];

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [checkoutActionSet as ActionSetEntity],
            });
            // => evaluateTokenAmountToAuthorize
            when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);
            // => getTokenAuthorizationPayload
            when(t721c.get()).thenResolve(t721cInstance);

            // TRIGGER
            await expect(
                context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                    data: input,
                } as Job<TicketMintingTransactionSequenceBuilderTaskInput>),
            ).rejects.toMatchObject(new NestError(`Multiple currencies not allowed`));

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).once();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
        });

        it('should fail on not T721Token currency', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const t721ControllerAddress = '0x36928500Bc1dCd7af6a2B4008875CC336b927D57';
            const t721TokenAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const t721AdminAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const gemOrderId = 'gem_order_id';
            const buyerId = 'user_id';
            const buyer: UserDto = {
                id: buyerId,
                address: buyerAddress,
            } as UserDto;
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const mintingEncoded = '0xencodedminting';
            const t721cInstance = {
                _address: t721ControllerAddress,
                methods: {
                    mint: () => ({
                        encodeABI: () => mintingEncoded,
                    }),
                },
            };
            const t721AdminInstance = {
                _address: t721AdminAddress,
            };
            const t721c = mock(ContractsControllerBase);
            const mmInstance = {
                methods: {},
            };
            const approveEncoded = '0xencodedapprove';
            const t721tokenInstance = {
                _address: t721TokenAddress,
                methods: {
                    allowance: () => ({
                        call: () => '0',
                    }),
                    approve: () => ({
                        encodeABI: () => approveEncoded,
                    }),
                },
            };
            const mm = mock(ContractsControllerBase);
            const ticketForgeInstance = {
                methods: {
                    getScope: () => ({
                        call: () => ({
                            exists: true,
                            scope_index: 0,
                        }),
                    }),
                },
            };
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721TokenInvalid',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const t721CurrencyERC20: ERC20Currency = {
                type: 'erc20',
                name: 'T721Token',
                module: 't721',
                address: t721TokenAddress,
                dollarPeg: 1,
                controller: instance(context.t721TokenServiceMock),
                feeComputer: () => '0',
            };
            const code = '12345';
            const authorizationOne: Partial<AuthorizationEntity> = {
                id: authorizationOneId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expiration.getTime() / 1000),
                ),
            };
            const ticketsPredictionInput = [
                {
                    buyer: buyerAddress,
                    categoryId: categoryOneId,
                    authorizationId: authorizationOneId,
                    groupId: groupId,
                },
            ];
            const ticketsPredictionOutput = [
                {
                    id: '181927450982374509823745',
                    owner: buyerAddress,
                } as TicketEntity,
            ];
            const transactions = [
                {
                    from: buyerAddress,
                    to: t721TokenAddress,
                    data: approveEncoded,
                    value: '0',
                },
                {
                    from: buyerAddress,
                    to: t721ControllerAddress,
                    data: mintingEncoded,
                    value: '0',
                    onConfirm: {
                        name: '@minting/confirmation',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                    onFailure: {
                        name: '@minting/failure',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                },
            ];

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [checkoutActionSet as ActionSetEntity],
            });
            // => evaluateTokenAmountToAuthorize
            when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);
            when(t721c.get()).thenResolve(t721cInstance);

            // TRIGGER
            await expect(
                context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                    data: input,
                } as Job<TicketMintingTransactionSequenceBuilderTaskInput>),
            ).rejects.toMatchObject(new NestError(`Only T721Token allowed`));

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).once();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
        });

        it('should fail on cart fetch error', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const gemOrderId = 'gem_order_id';
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const t721c = mock(ContractsControllerBase);
            const mm = mock(ContractsControllerBase);

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // TRIGGER
            await expect(
                context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                    data: input,
                } as Job<TicketMintingTransactionSequenceBuilderTaskInput>),
            ).rejects.toMatchObject(
                new NestError(`Unable to recover cart for minting initialization: unexpected_error`),
            );

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).once();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
        });

        it('should fail on cart empty fetch', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const gemOrderId = 'gem_order_id';
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const t721c = mock(ContractsControllerBase);
            const mm = mock(ContractsControllerBase);

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            // TRIGGER
            await expect(
                context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                    data: input,
                } as Job<TicketMintingTransactionSequenceBuilderTaskInput>),
            ).rejects.toMatchObject(new NestError(`Unable to recover cart for minting initialization: cart not found`));

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).once();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
        });

        it('should fail on checkout fetch error', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const gemOrderId = 'gem_order_id';
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const t721c = mock(ContractsControllerBase);
            const mm = mock(ContractsControllerBase);
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: [checkoutActionSet as ActionSetEntity],
            });

            // TRIGGER
            await expect(
                context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                    data: input,
                } as Job<TicketMintingTransactionSequenceBuilderTaskInput>),
            ).rejects.toMatchObject(
                new NestError(`Unable to recover checkout for minting initialization: unexpected_error`),
            );

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).once();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
        });

        it('should fail on empty checkout fetch', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const gemOrderId = 'gem_order_id';
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const t721c = mock(ContractsControllerBase);
            const mm = mock(ContractsControllerBase);
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            // TRIGGER
            await expect(
                context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                    data: input,
                } as Job<TicketMintingTransactionSequenceBuilderTaskInput>),
            ).rejects.toMatchObject(
                new NestError(`Unable to recover checkout for minting initialization: checkout not found`),
            );

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).once();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
        });

        it('should fail on approval throw', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const t721ControllerAddress = '0x36928500Bc1dCd7af6a2B4008875CC336b927D57';
            const t721TokenAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const gemOrderId = 'gem_order_id';
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const mintingEncoded = '0xencodedminting';
            const t721cInstance = {
                _address: t721ControllerAddress,
                methods: {
                    mint: () => ({
                        encodeABI: () => mintingEncoded,
                    }),
                },
            };
            const t721c = mock(ContractsControllerBase);
            const t721tokenInstance = {
                _address: t721TokenAddress,
                methods: {
                    allowance: () => ({
                        call: () => '0',
                    }),
                    approve: () => ({
                        encodeABI: () => {
                            throw new NestError(`reverted`);
                        },
                    }),
                },
            };
            const mm = mock(ContractsControllerBase);
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [checkoutActionSet as ActionSetEntity],
            });
            // => evaluateTokenAmountToAuthorize
            when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);
            // => getTokenAuthorizationPayload
            when(t721c.get()).thenResolve(t721cInstance);

            // TRIGGER
            await expect(
                context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                    data: input,
                } as Job<TicketMintingTransactionSequenceBuilderTaskInput>),
            ).rejects.toMatchObject(new NestError(`Unable to create token approval call: reverted`));

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).once();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
            // => evaluateTokenAmountToAuthorize
            verify(context.t721TokenServiceMock.get()).times(3);
            // => getTokenAuthorizationPayload
            verify(t721c.get()).times(2);
        });

        it('should fail currency type error', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const t721ControllerAddress = '0x36928500Bc1dCd7af6a2B4008875CC336b927D57';
            const t721TokenAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const t721AdminAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const gemOrderId = 'gem_order_id';
            const buyerId = 'user_id';
            const buyer: UserDto = {
                id: buyerId,
                address: buyerAddress,
            } as UserDto;
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const mintingEncoded = '0xencodedminting';
            const t721cInstance = {
                _address: t721ControllerAddress,
                methods: {
                    mint: () => ({
                        encodeABI: () => mintingEncoded,
                    }),
                },
            };
            const t721AdminInstance = {
                _address: t721AdminAddress,
            };
            const t721c = mock(ContractsControllerBase);
            const mmInstance = {
                methods: {},
            };
            const approveEncoded = '0xencodedapprove';
            const t721tokenInstance = {
                _address: t721TokenAddress,
                methods: {
                    allowance: () => ({
                        call: () => '0',
                    }),
                    approve: () => ({
                        encodeABI: () => approveEncoded,
                    }),
                },
            };
            const mm = mock(ContractsControllerBase);
            const ticketForgeInstance = {
                methods: {
                    getScope: () => ({
                        call: () => ({
                            exists: true,
                            scope_index: 0,
                        }),
                    }),
                },
            };
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const t721CurrencyERC20: ERC20Currency = {
                type: 'set',
                name: 'T721Token',
                module: 't721',
                address: t721TokenAddress,
                dollarPeg: 1,
                controller: instance(context.t721TokenServiceMock),
                feeComputer: () => '0',
            };
            const code = '12345';
            const authorizationOne: Partial<AuthorizationEntity> = {
                id: authorizationOneId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expiration.getTime() / 1000),
                ),
            };
            const ticketsPredictionInput = [
                {
                    buyer: buyerAddress,
                    categoryId: categoryOneId,
                    authorizationId: authorizationOneId,
                    groupId: groupId,
                },
            ];
            const ticketsPredictionOutput = [
                {
                    id: '181927450982374509823745',
                    owner: buyerAddress,
                } as TicketEntity,
            ];
            const transactions = [
                {
                    from: buyerAddress,
                    to: t721TokenAddress,
                    data: approveEncoded,
                    value: '0',
                },
                {
                    from: buyerAddress,
                    to: t721ControllerAddress,
                    data: mintingEncoded,
                    value: '0',
                    onConfirm: {
                        name: '@minting/confirmation',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                    onFailure: {
                        name: '@minting/failure',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                },
            ];

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [checkoutActionSet as ActionSetEntity],
            });
            // => evaluateTokenAmountToAuthorize
            when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);
            // => getTokenAuthorizationPayload
            when(t721c.get()).thenResolve(t721cInstance);
            // => generateTicketMintingTransactions
            when(context.currenciesServiceMock.get('T721Token')).thenResolve(t721CurrencyERC20);

            // TRIGGER
            await expect(
                context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                    data: input,
                } as Job<TicketMintingTransactionSequenceBuilderTaskInput>),
            ).rejects.toMatchObject(new NestError(`Invalid currency type on final step: set`));

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).once();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
            // => evaluateTokenAmountToAuthorize
            verify(context.t721TokenServiceMock.get()).times(3);
            // => getTokenAuthorizationPayload
            verify(t721c.get()).times(2);
            // => generateTicketMintingTransactions
            verify(context.currenciesServiceMock.get('T721Token')).once();
        });

        it('should fail on authorization fetch error', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const t721ControllerAddress = '0x36928500Bc1dCd7af6a2B4008875CC336b927D57';
            const t721TokenAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const t721AdminAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const gemOrderId = 'gem_order_id';
            const buyerId = 'user_id';
            const buyer: UserDto = {
                id: buyerId,
                address: buyerAddress,
            } as UserDto;
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const mintingEncoded = '0xencodedminting';
            const t721cInstance = {
                _address: t721ControllerAddress,
                methods: {
                    mint: () => ({
                        encodeABI: () => mintingEncoded,
                    }),
                },
            };
            const t721AdminInstance = {
                _address: t721AdminAddress,
            };
            const t721c = mock(ContractsControllerBase);
            const mmInstance = {
                methods: {},
            };
            const approveEncoded = '0xencodedapprove';
            const t721tokenInstance = {
                _address: t721TokenAddress,
                methods: {
                    allowance: () => ({
                        call: () => '0',
                    }),
                    approve: () => ({
                        encodeABI: () => approveEncoded,
                    }),
                },
            };
            const mm = mock(ContractsControllerBase);
            const ticketForgeInstance = {
                methods: {
                    getScope: () => ({
                        call: () => ({
                            exists: true,
                            scope_index: 0,
                        }),
                    }),
                },
            };
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const t721CurrencyERC20: ERC20Currency = {
                type: 'erc20',
                name: 'T721Token',
                module: 't721',
                address: t721TokenAddress,
                dollarPeg: 1,
                controller: instance(context.t721TokenServiceMock),
                feeComputer: () => '0',
            };
            const code = '12345';
            const authorizationOne: Partial<AuthorizationEntity> = {
                id: authorizationOneId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expiration.getTime() / 1000),
                ),
            };
            const ticketsPredictionInput = [
                {
                    buyer: buyerAddress,
                    categoryId: categoryOneId,
                    authorizationId: authorizationOneId,
                    groupId: groupId,
                },
            ];
            const ticketsPredictionOutput = [
                {
                    id: '181927450982374509823745',
                    owner: buyerAddress,
                } as TicketEntity,
            ];
            const transactions = [
                {
                    from: buyerAddress,
                    to: t721TokenAddress,
                    data: approveEncoded,
                    value: '0',
                },
                {
                    from: buyerAddress,
                    to: t721ControllerAddress,
                    data: mintingEncoded,
                    value: '0',
                    onConfirm: {
                        name: '@minting/confirmation',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                    onFailure: {
                        name: '@minting/failure',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                },
            ];

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [checkoutActionSet as ActionSetEntity],
            });
            // => evaluateTokenAmountToAuthorize
            when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);
            // => getTokenAuthorizationPayload
            when(t721c.get()).thenResolve(t721cInstance);
            // => generateTicketMintingTransactions
            when(context.currenciesServiceMock.get('T721Token')).thenResolve(t721CurrencyERC20);
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // TRIGGER
            await expect(
                context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                    data: input,
                } as Job<TicketMintingTransactionSequenceBuilderTaskInput>),
            ).rejects.toMatchObject(
                new NestError(`Cannot fetch or find authorization entity ${authorizationOneId}: unexpected_error`),
            );

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).once();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
            // => evaluateTokenAmountToAuthorize
            verify(context.t721TokenServiceMock.get()).times(3);
            // => getTokenAuthorizationPayload
            verify(t721c.get()).times(2);
            // => generateTicketMintingTransactions
            verify(context.currenciesServiceMock.get('T721Token')).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
        });

        it('should fail on authorization not found', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const t721ControllerAddress = '0x36928500Bc1dCd7af6a2B4008875CC336b927D57';
            const t721TokenAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const t721AdminAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const gemOrderId = 'gem_order_id';
            const buyerId = 'user_id';
            const buyer: UserDto = {
                id: buyerId,
                address: buyerAddress,
            } as UserDto;
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const mintingEncoded = '0xencodedminting';
            const t721cInstance = {
                _address: t721ControllerAddress,
                methods: {
                    mint: () => ({
                        encodeABI: () => mintingEncoded,
                    }),
                },
            };
            const t721AdminInstance = {
                _address: t721AdminAddress,
            };
            const t721c = mock(ContractsControllerBase);
            const mmInstance = {
                methods: {},
            };
            const approveEncoded = '0xencodedapprove';
            const t721tokenInstance = {
                _address: t721TokenAddress,
                methods: {
                    allowance: () => ({
                        call: () => '0',
                    }),
                    approve: () => ({
                        encodeABI: () => approveEncoded,
                    }),
                },
            };
            const mm = mock(ContractsControllerBase);
            const ticketForgeInstance = {
                methods: {
                    getScope: () => ({
                        call: () => ({
                            exists: true,
                            scope_index: 0,
                        }),
                    }),
                },
            };
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const t721CurrencyERC20: ERC20Currency = {
                type: 'erc20',
                name: 'T721Token',
                module: 't721',
                address: t721TokenAddress,
                dollarPeg: 1,
                controller: instance(context.t721TokenServiceMock),
                feeComputer: () => '0',
            };
            const code = '12345';
            const authorizationOne: Partial<AuthorizationEntity> = {
                id: authorizationOneId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expiration.getTime() / 1000),
                ),
            };
            const ticketsPredictionInput = [
                {
                    buyer: buyerAddress,
                    categoryId: categoryOneId,
                    authorizationId: authorizationOneId,
                    groupId: groupId,
                },
            ];
            const ticketsPredictionOutput = [
                {
                    id: '181927450982374509823745',
                    owner: buyerAddress,
                } as TicketEntity,
            ];
            const transactions = [
                {
                    from: buyerAddress,
                    to: t721TokenAddress,
                    data: approveEncoded,
                    value: '0',
                },
                {
                    from: buyerAddress,
                    to: t721ControllerAddress,
                    data: mintingEncoded,
                    value: '0',
                    onConfirm: {
                        name: '@minting/confirmation',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                    onFailure: {
                        name: '@minting/failure',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                },
            ];

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [checkoutActionSet as ActionSetEntity],
            });
            // => evaluateTokenAmountToAuthorize
            when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);
            // => getTokenAuthorizationPayload
            when(t721c.get()).thenResolve(t721cInstance);
            // => generateTicketMintingTransactions
            when(context.currenciesServiceMock.get('T721Token')).thenResolve(t721CurrencyERC20);
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            // TRIGGER
            await expect(
                context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                    data: input,
                } as Job<TicketMintingTransactionSequenceBuilderTaskInput>),
            ).rejects.toMatchObject(
                new NestError(
                    `Cannot fetch or find authorization entity ${authorizationOneId}: authorization not found`,
                ),
            );

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).once();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
            // => evaluateTokenAmountToAuthorize
            verify(context.t721TokenServiceMock.get()).times(3);
            // => getTokenAuthorizationPayload
            verify(t721c.get()).times(2);
            // => generateTicketMintingTransactions
            verify(context.currenciesServiceMock.get('T721Token')).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
        });

        it('should on multiple expirations mismatch', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const t721ControllerAddress = '0x36928500Bc1dCd7af6a2B4008875CC336b927D57';
            const t721TokenAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const t721AdminAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const gemOrderId = 'gem_order_id';
            const buyerId = 'user_id';
            const buyer: UserDto = {
                id: buyerId,
                address: buyerAddress,
            } as UserDto;
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const mintingEncoded = '0xencodedminting';
            const t721cInstance = {
                _address: t721ControllerAddress,
                methods: {
                    mint: () => ({
                        encodeABI: () => mintingEncoded,
                    }),
                },
            };
            const t721AdminInstance = {
                _address: t721AdminAddress,
            };
            const t721c = mock(ContractsControllerBase);
            const mmInstance = {
                methods: {},
            };
            const approveEncoded = '0xencodedapprove';
            const t721tokenInstance = {
                _address: t721TokenAddress,
                methods: {
                    allowance: () => ({
                        call: () => '0',
                    }),
                    approve: () => ({
                        encodeABI: () => approveEncoded,
                    }),
                },
            };
            const mm = mock(ContractsControllerBase);
            const ticketForgeInstance = {
                methods: {
                    getScope: () => ({
                        call: () => ({
                            exists: true,
                            scope_index: 0,
                        }),
                    }),
                },
            };
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const authorizationTwoId = 'authorization_two_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const expirationTwo = new Date(Date.now() + 3 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationTwoId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration: expirationTwo,
                    },
                ],
                commitType: 'stripe',
                total: [price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const t721CurrencyERC20: ERC20Currency = {
                type: 'erc20',
                name: 'T721Token',
                module: 't721',
                address: t721TokenAddress,
                dollarPeg: 1,
                controller: instance(context.t721TokenServiceMock),
                feeComputer: () => '0',
            };
            const code = '12345';
            const authorizationOne: Partial<AuthorizationEntity> = {
                id: authorizationOneId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expiration.getTime() / 1000),
                ),
            };
            const authorizationTwo: Partial<AuthorizationEntity> = {
                id: authorizationTwoId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expirationTwo.getTime() / 1000),
                ),
            };
            const ticketsPredictionInput = [
                {
                    buyer: buyerAddress,
                    categoryId: categoryOneId,
                    authorizationId: authorizationOneId,
                    groupId: groupId,
                },
            ];
            const ticketsPredictionOutput = [
                {
                    id: '181927450982374509823745',
                    owner: buyerAddress,
                } as TicketEntity,
            ];
            const transactions = [
                {
                    from: buyerAddress,
                    to: t721TokenAddress,
                    data: approveEncoded,
                    value: '0',
                },
                {
                    from: buyerAddress,
                    to: t721ControllerAddress,
                    data: mintingEncoded,
                    value: '0',
                    onConfirm: {
                        name: '@minting/confirmation',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                    onFailure: {
                        name: '@minting/failure',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                },
            ];

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [checkoutActionSet as ActionSetEntity],
            });
            // => evaluateTokenAmountToAuthorize
            when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);
            // => getTokenAuthorizationPayload
            when(t721c.get()).thenResolve(t721cInstance);
            // => generateTicketMintingTransactions
            when(context.currenciesServiceMock.get('T721Token')).thenResolve(t721CurrencyERC20);
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationOne as AuthorizationEntity],
            });
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationTwoId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationTwo as AuthorizationEntity],
            });

            // TRIGGER
            await expect(
                context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                    data: input,
                } as Job<TicketMintingTransactionSequenceBuilderTaskInput>),
            ).rejects.toMatchObject(new NestError(`Cannot proceed with authorizations with different expirations`));

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).once();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
            // => evaluateTokenAmountToAuthorize
            verify(context.t721TokenServiceMock.get()).times(3);
            // => getTokenAuthorizationPayload
            verify(t721c.get()).times(2);
            // => generateTicketMintingTransactions
            verify(context.currenciesServiceMock.get('T721Token')).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationTwoId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
        });

        it('should fail on invalid scope', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const t721ControllerAddress = '0x36928500Bc1dCd7af6a2B4008875CC336b927D57';
            const t721TokenAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const t721AdminAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const gemOrderId = 'gem_order_id';
            const buyerId = 'user_id';
            const buyer: UserDto = {
                id: buyerId,
                address: buyerAddress,
            } as UserDto;
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const mintingEncoded = '0xencodedminting';
            const t721cInstance = {
                _address: t721ControllerAddress,
                methods: {
                    mint: () => ({
                        encodeABI: () => mintingEncoded,
                    }),
                },
            };
            const t721AdminInstance = {
                _address: t721AdminAddress,
            };
            const t721c = mock(ContractsControllerBase);
            const mmInstance = {
                methods: {},
            };
            const approveEncoded = '0xencodedapprove';
            const t721tokenInstance = {
                _address: t721TokenAddress,
                methods: {
                    allowance: () => ({
                        call: () => '0',
                    }),
                    approve: () => ({
                        encodeABI: () => approveEncoded,
                    }),
                },
            };
            const mm = mock(ContractsControllerBase);
            const ticketForgeInstance = {
                methods: {
                    getScope: () => ({
                        call: () => ({
                            exists: false,
                            scope_index: 0,
                        }),
                    }),
                },
            };
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const t721CurrencyERC20: ERC20Currency = {
                type: 'erc20',
                name: 'T721Token',
                module: 't721',
                address: t721TokenAddress,
                dollarPeg: 1,
                controller: instance(context.t721TokenServiceMock),
                feeComputer: () => '0',
            };
            const code = '12345';
            const authorizationOne: Partial<AuthorizationEntity> = {
                id: authorizationOneId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expiration.getTime() / 1000),
                ),
            };
            const ticketsPredictionInput = [
                {
                    buyer: buyerAddress,
                    categoryId: categoryOneId,
                    authorizationId: authorizationOneId,
                    groupId: groupId,
                },
            ];
            const ticketsPredictionOutput = [
                {
                    id: '181927450982374509823745',
                    owner: buyerAddress,
                } as TicketEntity,
            ];
            const transactions = [
                {
                    from: buyerAddress,
                    to: t721TokenAddress,
                    data: approveEncoded,
                    value: '0',
                },
                {
                    from: buyerAddress,
                    to: t721ControllerAddress,
                    data: mintingEncoded,
                    value: '0',
                    onConfirm: {
                        name: '@minting/confirmation',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                    onFailure: {
                        name: '@minting/failure',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                },
            ];

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [checkoutActionSet as ActionSetEntity],
            });
            // => evaluateTokenAmountToAuthorize
            when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);
            // => getTokenAuthorizationPayload
            when(t721c.get()).thenResolve(t721cInstance);
            // => generateTicketMintingTransactions
            when(context.currenciesServiceMock.get('T721Token')).thenResolve(t721CurrencyERC20);
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationOne as AuthorizationEntity],
            });
            when(context.t721AdminServiceMock.get()).thenResolve(t721AdminInstance);
            when(context.ticketforgeServiceMock.get()).thenResolve(ticketForgeInstance);

            // TRIGGER
            await expect(
                context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                    data: input,
                } as Job<TicketMintingTransactionSequenceBuilderTaskInput>),
            ).rejects.toMatchObject(new NestError(`Current server ticketforge scope does not exist`));

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).twice();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
            // => evaluateTokenAmountToAuthorize
            verify(context.t721TokenServiceMock.get()).times(3);
            // => getTokenAuthorizationPayload
            verify(t721c.get()).times(2);
            // => generateTicketMintingTransactions
            verify(context.currenciesServiceMock.get('T721Token')).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
            verify(context.t721AdminServiceMock.get()).once();
            verify(context.ticketforgeServiceMock.get()).once();
        });

        it('should fail on controller address resolutio nerror', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const t721ControllerAddress = '0x36928500Bc1dCd7af6a2B4008875CC336b927D57';
            const t721TokenAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const t721AdminAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const gemOrderId = 'gem_order_id';
            const buyerId = 'user_id';
            const buyer: UserDto = {
                id: buyerId,
                address: buyerAddress,
            } as UserDto;
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const mintingEncoded = '0xencodedminting';
            const t721cInstance = {
                _address: t721ControllerAddress,
                methods: {
                    mint: () => ({
                        encodeABI: () => mintingEncoded,
                    }),
                },
            };
            const t721AdminInstance = {
                _address: t721AdminAddress,
            };
            const t721c = mock(ContractsControllerBase);
            const mmInstance = {
                methods: {},
            };
            const approveEncoded = '0xencodedapprove';
            const t721tokenInstance = {
                _address: t721TokenAddress,
                methods: {
                    allowance: () => ({
                        call: () => '0',
                    }),
                    approve: () => ({
                        encodeABI: () => approveEncoded,
                    }),
                },
            };
            const mm = mock(ContractsControllerBase);
            const ticketForgeInstance = {
                methods: {
                    getScope: () => ({
                        call: () => ({
                            exists: true,
                            scope_index: 0,
                        }),
                    }),
                },
            };
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const t721CurrencyERC20: ERC20Currency = {
                type: 'erc20',
                name: 'T721Token',
                module: 't721',
                address: t721TokenAddress,
                dollarPeg: 1,
                controller: instance(context.t721TokenServiceMock),
                feeComputer: () => '0',
            };
            const code = '12345';
            const authorizationOne: Partial<AuthorizationEntity> = {
                id: authorizationOneId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expiration.getTime() / 1000),
                ),
            };
            const ticketsPredictionInput = [
                {
                    buyer: buyerAddress,
                    categoryId: categoryOneId,
                    authorizationId: authorizationOneId,
                    groupId: groupId,
                },
            ];
            const ticketsPredictionOutput = [
                {
                    id: '181927450982374509823745',
                    owner: buyerAddress,
                } as TicketEntity,
            ];
            const transactions = [
                {
                    from: buyerAddress,
                    to: t721TokenAddress,
                    data: approveEncoded,
                    value: '0',
                },
                {
                    from: buyerAddress,
                    to: t721ControllerAddress,
                    data: mintingEncoded,
                    value: '0',
                    onConfirm: {
                        name: '@minting/confirmation',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                    onFailure: {
                        name: '@minting/failure',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                },
            ];

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [checkoutActionSet as ActionSetEntity],
            });
            // => evaluateTokenAmountToAuthorize
            when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);
            // => getTokenAuthorizationPayload
            when(t721c.get()).thenResolve(t721cInstance);
            // => generateTicketMintingTransactions
            when(context.currenciesServiceMock.get('T721Token')).thenResolve(t721CurrencyERC20);
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationOne as AuthorizationEntity],
            });
            when(context.t721AdminServiceMock.get()).thenResolve(t721AdminInstance);
            when(context.ticketforgeServiceMock.get()).thenResolve(ticketForgeInstance);
            when(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // TRIGGER
            await expect(
                context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                    data: input,
                } as Job<TicketMintingTransactionSequenceBuilderTaskInput>),
            ).rejects.toMatchObject(new NestError(`Unable to recover controller id used for the group_id generation`));

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).twice();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
            // => evaluateTokenAmountToAuthorize
            verify(context.t721TokenServiceMock.get()).times(3);
            // => getTokenAuthorizationPayload
            verify(t721c.get()).times(2);
            // => generateTicketMintingTransactions
            verify(context.currenciesServiceMock.get('T721Token')).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
            verify(context.t721AdminServiceMock.get()).once();
            verify(context.ticketforgeServiceMock.get()).once();
            verify(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).once();
        });

        it('should fail on ticket prediction error', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const t721ControllerAddress = '0x36928500Bc1dCd7af6a2B4008875CC336b927D57';
            const t721TokenAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const t721AdminAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const gemOrderId = 'gem_order_id';
            const buyerId = 'user_id';
            const buyer: UserDto = {
                id: buyerId,
                address: buyerAddress,
            } as UserDto;
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const mintingEncoded = '0xencodedminting';
            const t721cInstance = {
                _address: t721ControllerAddress,
                methods: {
                    mint: () => ({
                        encodeABI: () => mintingEncoded,
                    }),
                },
            };
            const t721AdminInstance = {
                _address: t721AdminAddress,
            };
            const t721c = mock(ContractsControllerBase);
            const mmInstance = {
                methods: {},
            };
            const approveEncoded = '0xencodedapprove';
            const t721tokenInstance = {
                _address: t721TokenAddress,
                methods: {
                    allowance: () => ({
                        call: () => '0',
                    }),
                    approve: () => ({
                        encodeABI: () => approveEncoded,
                    }),
                },
            };
            const mm = mock(ContractsControllerBase);
            const ticketForgeInstance = {
                methods: {
                    getScope: () => ({
                        call: () => ({
                            exists: true,
                            scope_index: 0,
                        }),
                    }),
                },
            };
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const t721CurrencyERC20: ERC20Currency = {
                type: 'erc20',
                name: 'T721Token',
                module: 't721',
                address: t721TokenAddress,
                dollarPeg: 1,
                controller: instance(context.t721TokenServiceMock),
                feeComputer: () => '0',
            };
            const code = '12345';
            const authorizationOne: Partial<AuthorizationEntity> = {
                id: authorizationOneId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expiration.getTime() / 1000),
                ),
            };
            const ticketsPredictionInput = [
                {
                    buyer: buyerAddress,
                    categoryId: categoryOneId,
                    authorizationId: authorizationOneId,
                    groupId: groupId,
                },
            ];
            const ticketsPredictionOutput = [
                {
                    id: '181927450982374509823745',
                    owner: buyerAddress,
                } as TicketEntity,
            ];
            const transactions = [
                {
                    from: buyerAddress,
                    to: t721TokenAddress,
                    data: approveEncoded,
                    value: '0',
                },
                {
                    from: buyerAddress,
                    to: t721ControllerAddress,
                    data: mintingEncoded,
                    value: '0',
                    onConfirm: {
                        name: '@minting/confirmation',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                    onFailure: {
                        name: '@minting/failure',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                },
            ];

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [checkoutActionSet as ActionSetEntity],
            });
            // => evaluateTokenAmountToAuthorize
            when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);
            // => getTokenAuthorizationPayload
            when(t721c.get()).thenResolve(t721cInstance);
            // => generateTicketMintingTransactions
            when(context.currenciesServiceMock.get('T721Token')).thenResolve(t721CurrencyERC20);
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationOne as AuthorizationEntity],
            });
            when(context.t721AdminServiceMock.get()).thenResolve(t721AdminInstance);
            when(context.ticketforgeServiceMock.get()).thenResolve(ticketForgeInstance);
            when(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).thenResolve({
                error: null,
                response: [controllerAddress],
            });
            // => generateTickets
            when(context.ticketsServiceMock.predictTickets(deepEqual(ticketsPredictionInput))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // TRIGGER
            await expect(
                context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                    data: input,
                } as Job<TicketMintingTransactionSequenceBuilderTaskInput>),
            ).rejects.toMatchObject(new NestError(`Unable to generate ticket before minting: unexpected_error`));

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).twice();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
            // => evaluateTokenAmountToAuthorize
            verify(context.t721TokenServiceMock.get()).times(3);
            // => getTokenAuthorizationPayload
            verify(t721c.get()).times(2);
            // => generateTicketMintingTransactions
            verify(context.currenciesServiceMock.get('T721Token')).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
            verify(context.t721AdminServiceMock.get()).once();
            verify(context.ticketforgeServiceMock.get()).once();
            verify(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).once();
            // => generateTickets
            verify(context.ticketsServiceMock.predictTickets(deepEqual(ticketsPredictionInput))).once();
        });

        it('should fail on user fetch fail', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const t721ControllerAddress = '0x36928500Bc1dCd7af6a2B4008875CC336b927D57';
            const t721TokenAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const t721AdminAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const gemOrderId = 'gem_order_id';
            const buyerId = 'user_id';
            const buyer: UserDto = {
                id: buyerId,
                address: buyerAddress,
            } as UserDto;
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const mintingEncoded = '0xencodedminting';
            const t721cInstance = {
                _address: t721ControllerAddress,
                methods: {
                    mint: () => ({
                        encodeABI: () => mintingEncoded,
                    }),
                },
            };
            const t721AdminInstance = {
                _address: t721AdminAddress,
            };
            const t721c = mock(ContractsControllerBase);
            const mmInstance = {
                methods: {},
            };
            const approveEncoded = '0xencodedapprove';
            const t721tokenInstance = {
                _address: t721TokenAddress,
                methods: {
                    allowance: () => ({
                        call: () => '0',
                    }),
                    approve: () => ({
                        encodeABI: () => approveEncoded,
                    }),
                },
            };
            const mm = mock(ContractsControllerBase);
            const ticketForgeInstance = {
                methods: {
                    getScope: () => ({
                        call: () => ({
                            exists: true,
                            scope_index: 0,
                        }),
                    }),
                },
            };
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const t721CurrencyERC20: ERC20Currency = {
                type: 'erc20',
                name: 'T721Token',
                module: 't721',
                address: t721TokenAddress,
                dollarPeg: 1,
                controller: instance(context.t721TokenServiceMock),
                feeComputer: () => '0',
            };
            const code = '12345';
            const authorizationOne: Partial<AuthorizationEntity> = {
                id: authorizationOneId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expiration.getTime() / 1000),
                ),
            };
            const ticketsPredictionInput = [
                {
                    buyer: buyerAddress,
                    categoryId: categoryOneId,
                    authorizationId: authorizationOneId,
                    groupId: groupId,
                },
            ];
            const ticketsPredictionOutput = [
                {
                    id: '181927450982374509823745',
                    owner: buyerAddress,
                } as TicketEntity,
            ];
            const transactions = [
                {
                    from: buyerAddress,
                    to: t721TokenAddress,
                    data: approveEncoded,
                    value: '0',
                },
                {
                    from: buyerAddress,
                    to: t721ControllerAddress,
                    data: mintingEncoded,
                    value: '0',
                    onConfirm: {
                        name: '@minting/confirmation',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                    onFailure: {
                        name: '@minting/failure',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                },
            ];

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [checkoutActionSet as ActionSetEntity],
            });
            // => evaluateTokenAmountToAuthorize
            when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);
            // => getTokenAuthorizationPayload
            when(t721c.get()).thenResolve(t721cInstance);
            // => generateTicketMintingTransactions
            when(context.currenciesServiceMock.get('T721Token')).thenResolve(t721CurrencyERC20);
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationOne as AuthorizationEntity],
            });
            when(context.t721AdminServiceMock.get()).thenResolve(t721AdminInstance);
            when(context.ticketforgeServiceMock.get()).thenResolve(ticketForgeInstance);
            when(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).thenResolve({
                error: null,
                response: [controllerAddress],
            });
            // => generateTickets
            when(context.ticketsServiceMock.predictTickets(deepEqual(ticketsPredictionInput))).thenResolve({
                error: null,
                response: ticketsPredictionOutput,
            });
            // <= ticketMintingTransactionSequenceBuilderTask
            when(context.usersServiceMock.findByAddress(buyerAddress)).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // TRIGGER
            await expect(
                context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                    data: input,
                } as Job<TicketMintingTransactionSequenceBuilderTaskInput>),
            ).rejects.toMatchObject(new NestError(`User linked to address ${buyerAddress} not found`));

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).twice();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
            // => evaluateTokenAmountToAuthorize
            verify(context.t721TokenServiceMock.get()).times(3);
            // => getTokenAuthorizationPayload
            verify(t721c.get()).times(4);
            // => generateTicketMintingTransactions
            verify(context.currenciesServiceMock.get('T721Token')).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
            verify(context.t721AdminServiceMock.get()).once();
            verify(context.ticketforgeServiceMock.get()).once();
            verify(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).once();
            // => generateTickets
            verify(context.ticketsServiceMock.predictTickets(deepEqual(ticketsPredictionInput))).once();
            // <= ticketMintingTransactionSequenceBuilderTask
            verify(context.usersServiceMock.findByAddress(buyerAddress)).once();
        });

        it('should fail on user empty fetch', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const t721ControllerAddress = '0x36928500Bc1dCd7af6a2B4008875CC336b927D57';
            const t721TokenAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const t721AdminAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const gemOrderId = 'gem_order_id';
            const buyerId = 'user_id';
            const buyer: UserDto = {
                id: buyerId,
                address: buyerAddress,
            } as UserDto;
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const mintingEncoded = '0xencodedminting';
            const t721cInstance = {
                _address: t721ControllerAddress,
                methods: {
                    mint: () => ({
                        encodeABI: () => mintingEncoded,
                    }),
                },
            };
            const t721AdminInstance = {
                _address: t721AdminAddress,
            };
            const t721c = mock(ContractsControllerBase);
            const mmInstance = {
                methods: {},
            };
            const approveEncoded = '0xencodedapprove';
            const t721tokenInstance = {
                _address: t721TokenAddress,
                methods: {
                    allowance: () => ({
                        call: () => '0',
                    }),
                    approve: () => ({
                        encodeABI: () => approveEncoded,
                    }),
                },
            };
            const mm = mock(ContractsControllerBase);
            const ticketForgeInstance = {
                methods: {
                    getScope: () => ({
                        call: () => ({
                            exists: true,
                            scope_index: 0,
                        }),
                    }),
                },
            };
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const t721CurrencyERC20: ERC20Currency = {
                type: 'erc20',
                name: 'T721Token',
                module: 't721',
                address: t721TokenAddress,
                dollarPeg: 1,
                controller: instance(context.t721TokenServiceMock),
                feeComputer: () => '0',
            };
            const code = '12345';
            const authorizationOne: Partial<AuthorizationEntity> = {
                id: authorizationOneId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expiration.getTime() / 1000),
                ),
            };
            const ticketsPredictionInput = [
                {
                    buyer: buyerAddress,
                    categoryId: categoryOneId,
                    authorizationId: authorizationOneId,
                    groupId: groupId,
                },
            ];
            const ticketsPredictionOutput = [
                {
                    id: '181927450982374509823745',
                    owner: buyerAddress,
                } as TicketEntity,
            ];
            const transactions = [
                {
                    from: buyerAddress,
                    to: t721TokenAddress,
                    data: approveEncoded,
                    value: '0',
                },
                {
                    from: buyerAddress,
                    to: t721ControllerAddress,
                    data: mintingEncoded,
                    value: '0',
                    onConfirm: {
                        name: '@minting/confirmation',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                    onFailure: {
                        name: '@minting/failure',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                },
            ];

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [checkoutActionSet as ActionSetEntity],
            });
            // => evaluateTokenAmountToAuthorize
            when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);
            // => getTokenAuthorizationPayload
            when(t721c.get()).thenResolve(t721cInstance);
            // => generateTicketMintingTransactions
            when(context.currenciesServiceMock.get('T721Token')).thenResolve(t721CurrencyERC20);
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationOne as AuthorizationEntity],
            });
            when(context.t721AdminServiceMock.get()).thenResolve(t721AdminInstance);
            when(context.ticketforgeServiceMock.get()).thenResolve(ticketForgeInstance);
            when(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).thenResolve({
                error: null,
                response: [controllerAddress],
            });
            // => generateTickets
            when(context.ticketsServiceMock.predictTickets(deepEqual(ticketsPredictionInput))).thenResolve({
                error: null,
                response: ticketsPredictionOutput,
            });
            // <= ticketMintingTransactionSequenceBuilderTask
            when(context.usersServiceMock.findByAddress(buyerAddress)).thenResolve({
                error: null,
                response: null,
            });

            // TRIGGER
            await expect(
                context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                    data: input,
                } as Job<TicketMintingTransactionSequenceBuilderTaskInput>),
            ).rejects.toMatchObject(new NestError(`User linked to address ${buyerAddress} not found`));

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).twice();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
            // => evaluateTokenAmountToAuthorize
            verify(context.t721TokenServiceMock.get()).times(3);
            // => getTokenAuthorizationPayload
            verify(t721c.get()).times(4);
            // => generateTicketMintingTransactions
            verify(context.currenciesServiceMock.get('T721Token')).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
            verify(context.t721AdminServiceMock.get()).once();
            verify(context.ticketforgeServiceMock.get()).once();
            verify(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).once();
            // => generateTickets
            verify(context.ticketsServiceMock.predictTickets(deepEqual(ticketsPredictionInput))).once();
            // <= ticketMintingTransactionSequenceBuilderTask
            verify(context.usersServiceMock.findByAddress(buyerAddress)).once();
        });

        it('should fail on authorization update error', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const t721ControllerAddress = '0x36928500Bc1dCd7af6a2B4008875CC336b927D57';
            const t721TokenAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const t721AdminAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const gemOrderId = 'gem_order_id';
            const buyerId = 'user_id';
            const buyer: UserDto = {
                id: buyerId,
                address: buyerAddress,
            } as UserDto;
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const mintingEncoded = '0xencodedminting';
            const t721cInstance = {
                _address: t721ControllerAddress,
                methods: {
                    mint: () => ({
                        encodeABI: () => mintingEncoded,
                    }),
                },
            };
            const t721AdminInstance = {
                _address: t721AdminAddress,
            };
            const t721c = mock(ContractsControllerBase);
            const mmInstance = {
                methods: {},
            };
            const approveEncoded = '0xencodedapprove';
            const t721tokenInstance = {
                _address: t721TokenAddress,
                methods: {
                    allowance: () => ({
                        call: () => '0',
                    }),
                    approve: () => ({
                        encodeABI: () => approveEncoded,
                    }),
                },
            };
            const mm = mock(ContractsControllerBase);
            const ticketForgeInstance = {
                methods: {
                    getScope: () => ({
                        call: () => ({
                            exists: true,
                            scope_index: 0,
                        }),
                    }),
                },
            };
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const t721CurrencyERC20: ERC20Currency = {
                type: 'erc20',
                name: 'T721Token',
                module: 't721',
                address: t721TokenAddress,
                dollarPeg: 1,
                controller: instance(context.t721TokenServiceMock),
                feeComputer: () => '0',
            };
            const code = '12345';
            const authorizationOne: Partial<AuthorizationEntity> = {
                id: authorizationOneId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expiration.getTime() / 1000),
                ),
            };
            const ticketsPredictionInput = [
                {
                    buyer: buyerAddress,
                    categoryId: categoryOneId,
                    authorizationId: authorizationOneId,
                    groupId: groupId,
                },
            ];
            const ticketsPredictionOutput = [
                {
                    id: '181927450982374509823745',
                    owner: buyerAddress,
                } as TicketEntity,
            ];
            const transactions = [
                {
                    from: buyerAddress,
                    to: t721TokenAddress,
                    data: approveEncoded,
                    value: '0',
                },
                {
                    from: buyerAddress,
                    to: t721ControllerAddress,
                    data: mintingEncoded,
                    value: '0',
                    onConfirm: {
                        name: '@minting/confirmation',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                    onFailure: {
                        name: '@minting/failure',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                },
            ];

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [checkoutActionSet as ActionSetEntity],
            });
            // => evaluateTokenAmountToAuthorize
            when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);
            // => getTokenAuthorizationPayload
            when(t721c.get()).thenResolve(t721cInstance);
            // => generateTicketMintingTransactions
            when(context.currenciesServiceMock.get('T721Token')).thenResolve(t721CurrencyERC20);
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationOne as AuthorizationEntity],
            });
            when(context.t721AdminServiceMock.get()).thenResolve(t721AdminInstance);
            when(context.ticketforgeServiceMock.get()).thenResolve(ticketForgeInstance);
            when(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).thenResolve({
                error: null,
                response: [controllerAddress],
            });
            // => generateTickets
            when(context.ticketsServiceMock.predictTickets(deepEqual(ticketsPredictionInput))).thenResolve({
                error: null,
                response: ticketsPredictionOutput,
            });
            // <= ticketMintingTransactionSequenceBuilderTask
            when(context.usersServiceMock.findByAddress(buyerAddress)).thenResolve({
                error: null,
                response: buyer,
            });
            // => setAuthorizationsToDispatched
            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        dispatched: true,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // TRIGGER
            await expect(
                context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                    data: input,
                } as Job<TicketMintingTransactionSequenceBuilderTaskInput>),
            ).rejects.toMatchObject(new NestError(`Authorization update failure: unexpected_error`));

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).twice();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
            // => evaluateTokenAmountToAuthorize
            verify(context.t721TokenServiceMock.get()).times(3);
            // => getTokenAuthorizationPayload
            verify(t721c.get()).times(4);
            // => generateTicketMintingTransactions
            verify(context.currenciesServiceMock.get('T721Token')).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
            verify(context.t721AdminServiceMock.get()).once();
            verify(context.ticketforgeServiceMock.get()).once();
            verify(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).once();
            // => generateTickets
            verify(context.ticketsServiceMock.predictTickets(deepEqual(ticketsPredictionInput))).once();
            // <= ticketMintingTransactionSequenceBuilderTask
            verify(context.usersServiceMock.findByAddress(buyerAddress)).once();
            // => setAuthorizationsToDispatched
            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        dispatched: true,
                    }),
                ),
            ).once();
        });

        it('should fail on txsequence build error', async function() {
            // DECLARE
            const cartActionSetId = 'cart_id';
            const checkoutActionSetId = 'checkout_id';
            const paymentIntentId = 'pi_laushfliaushfdliuahsdlifuhaslidfhu';
            const buyerAddress = '0xFD5d5dd6695c16E8c3f69aE2393770132225A194';
            const controllerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const t721ControllerAddress = '0x36928500Bc1dCd7af6a2B4008875CC336b927D57';
            const t721TokenAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const t721AdminAddress = '0xC6CDE7C39eB2f0F0095F41570af89eFC2C1Ea828';
            const gemOrderId = 'gem_order_id';
            const buyerId = 'user_id';
            const buyer: UserDto = {
                id: buyerId,
                address: buyerAddress,
            } as UserDto;
            const input: TicketMintingTransactionSequenceBuilderTaskInput = {
                cartActionSetId,
                checkoutActionSetId,
                gemOrderId,
            };
            const scope = 'test_scope';
            const mintingEncoded = '0xencodedminting';
            const t721cInstance = {
                _address: t721ControllerAddress,
                methods: {
                    mint: () => ({
                        encodeABI: () => mintingEncoded,
                    }),
                },
            };
            const t721AdminInstance = {
                _address: t721AdminAddress,
            };
            const t721c = mock(ContractsControllerBase);
            const mmInstance = {
                methods: {},
            };
            const approveEncoded = '0xencodedapprove';
            const t721tokenInstance = {
                _address: t721TokenAddress,
                methods: {
                    allowance: () => ({
                        call: () => '0',
                    }),
                    approve: () => ({
                        encodeABI: () => approveEncoded,
                    }),
                },
            };
            const mm = mock(ContractsControllerBase);
            const ticketForgeInstance = {
                methods: {
                    getScope: () => ({
                        call: () => ({
                            exists: true,
                            scope_index: 0,
                        }),
                    }),
                },
            };
            const categoryOneId = 'category_one_id';
            const categoryOneName = 'vip';
            const groupId = '0x7361646661736466000000000000000000000000000000000000000000000000';
            const authorizationOneId = 'authorization_one_id';
            const expiration = new Date(Date.now() + 2 * DAY);
            const price = {
                currency: 'T721Token',
                value: '100',
                log_value: 0,
            };
            const cartAuthorizationsData: CartAuthorizations = {
                authorizations: [
                    {
                        categoryId: categoryOneId,
                        price: {
                            currency: 'T721Token',
                            price: '100',
                        },
                        authorizationId: authorizationOneId,
                        groupId,
                        categoryName: categoryOneName,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        granterController: controllerAddress,
                        expiration,
                    },
                ],
                commitType: 'stripe',
                total: [price],
                fees: ['0'],
            };
            const cartActionSet: Partial<ActionSetEntity> = {
                id: cartActionSetId,
                actions: [
                    {} as ActionEntity,
                    {} as ActionEntity,
                    {
                        status: 'complete',
                        name: '@cart/authorizations',
                        data: JSON.stringify(cartAuthorizationsData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const checkoutResolveData: CheckoutResolve = {
                cartId: cartActionSetId,
                commitType: 'stripe',
                buyer: buyerAddress,
                stripe: {
                    paymentIntentId,
                    gemOrderId,
                },
            };
            const checkoutActionSet: Partial<ActionSetEntity> = {
                id: checkoutActionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@checkout/resolve',
                        data: JSON.stringify(checkoutResolveData),
                        type: 'input',
                        error: null,
                        private: true,
                    },
                ],
                current_status: 'complete',
                current_action: 1,
            };
            const t721CurrencyERC20: ERC20Currency = {
                type: 'erc20',
                name: 'T721Token',
                module: 't721',
                address: t721TokenAddress,
                dollarPeg: 1,
                controller: instance(context.t721TokenServiceMock),
                feeComputer: () => '0',
            };
            const code = '12345';
            const authorizationOne: Partial<AuthorizationEntity> = {
                id: authorizationOneId,
                signature: '0xsignature',
                codes: MintAuthorization.toCodesFormat(code),
                args: MintAuthorization.toArgsFormat(
                    MintAuthorization.encodePrices([
                        {
                            currency: t721TokenAddress,
                            value: price.value,
                            fee: '0',
                        },
                    ]),
                    groupId,
                    toB32(categoryOneName),
                    code,
                    Math.floor(expiration.getTime() / 1000),
                ),
            };
            const ticketsPredictionInput = [
                {
                    buyer: buyerAddress,
                    categoryId: categoryOneId,
                    authorizationId: authorizationOneId,
                    groupId: groupId,
                },
            ];
            const ticketsPredictionOutput = [
                {
                    id: '181927450982374509823745',
                    owner: buyerAddress,
                } as TicketEntity,
            ];
            const transactions = [
                {
                    from: buyerAddress,
                    to: t721TokenAddress,
                    data: approveEncoded,
                    value: '0',
                },
                {
                    from: buyerAddress,
                    to: t721ControllerAddress,
                    data: mintingEncoded,
                    value: '0',
                    onConfirm: {
                        name: '@minting/confirmation',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                    onFailure: {
                        name: '@minting/failure',
                        jobData: {
                            tickets: ticketsPredictionOutput.map((gtr: TicketEntity) => gtr.id),
                            authorizations: cartAuthorizationsData.authorizations.map(
                                (at: AuthorizedTicketMintingFormat) => [at.authorizationId, at.granter, at.grantee],
                            ),
                        },
                    },
                },
            ];

            // MOCK
            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(scope);
            when(context.ticketforgeServiceMock.getScopeContracts(scope)).thenReturn({
                mm: instance(mm),
                t721c: instance(t721c),
            });
            // => fetchAndVerifyCart
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [cartActionSet as ActionSetEntity],
            });
            // => fetchAndVerifyCheckout
            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [checkoutActionSet as ActionSetEntity],
            });
            // => evaluateTokenAmountToAuthorize
            when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);
            // => getTokenAuthorizationPayload
            when(t721c.get()).thenResolve(t721cInstance);
            // => generateTicketMintingTransactions
            when(context.currenciesServiceMock.get('T721Token')).thenResolve(t721CurrencyERC20);
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationOne as AuthorizationEntity],
            });
            when(context.t721AdminServiceMock.get()).thenResolve(t721AdminInstance);
            when(context.ticketforgeServiceMock.get()).thenResolve(ticketForgeInstance);
            when(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).thenResolve({
                error: null,
                response: [controllerAddress],
            });
            // => generateTickets
            when(context.ticketsServiceMock.predictTickets(deepEqual(ticketsPredictionInput))).thenResolve({
                error: null,
                response: ticketsPredictionOutput,
            });
            // <= ticketMintingTransactionSequenceBuilderTask
            when(context.usersServiceMock.findByAddress(buyerAddress)).thenResolve({
                error: null,
                response: buyer,
            });
            // => setAuthorizationsToDispatched
            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        dispatched: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });
            // <= ticketMintingTransactionSequenceBuilderTask
            when(
                context.actionSetsServiceMock.build(
                    'txseq_processor',
                    deepEqual(buyer),
                    deepEqual({
                        transactions,
                    }),
                    true,
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // TRIGGER
            await expect(
                context.mintingTasks.ticketMintingTransactionSequenceBuilderTask({
                    data: input,
                } as Job<TicketMintingTransactionSequenceBuilderTaskInput>),
            ).rejects.toMatchObject(new NestError(`Unable to create tx sequence actionset: unexpected_error`));

            // CHECK RETURNs

            // CHECK CALLS
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).twice();
            verify(context.ticketforgeServiceMock.getScopeContracts(scope)).once();
            // => fetchAndVerifyCart
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: cartActionSetId,
                    }),
                ),
            ).once();
            // => fetchAndVerifyCheckout
            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: checkoutActionSetId,
                    }),
                ),
            ).once();
            // => evaluateTokenAmountToAuthorize
            verify(context.t721TokenServiceMock.get()).times(3);
            // => getTokenAuthorizationPayload
            verify(t721c.get()).times(4);
            // => generateTicketMintingTransactions
            verify(context.currenciesServiceMock.get('T721Token')).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
            verify(context.t721AdminServiceMock.get()).once();
            verify(context.ticketforgeServiceMock.get()).once();
            verify(context.groupServiceMock.getGroupIDControllerFields(groupId, deepEqual(['id']))).once();
            // => generateTickets
            verify(context.ticketsServiceMock.predictTickets(deepEqual(ticketsPredictionInput))).once();
            // <= ticketMintingTransactionSequenceBuilderTask
            verify(context.usersServiceMock.findByAddress(buyerAddress)).once();
            // => setAuthorizationsToDispatched
            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationOneId,
                        granter: controllerAddress,
                        grantee: buyerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        dispatched: true,
                    }),
                ),
            ).once();
            // <= ticketMintingTransactionSequenceBuilderTask
            verify(
                context.actionSetsServiceMock.build(
                    'txseq_processor',
                    deepEqual(buyer),
                    deepEqual({
                        transactions,
                    }),
                    true,
                ),
            ).once();
        });
    });

    describe('onTicketMintingTransactionFailure', function() {
        it('should properly update authorizations and tickets', async function() {
            // DECLARE
            const transactionHash = '0xec9d18403c5007f9afb320e21f2c3dc1d6043a680476af13be2f00078d726df6';
            const granter = '0xB9AEc5d0Fcda8ac5377d2481B97B100e75a9FE9B';
            const grantee = '0xcdaD1e850b37372969191E395d2F23d892E6b7c2';
            const ticket = '9134875932764598237645982376459823764598';
            const authorizationId = 'authorization_id';
            const input = {
                transactionHash,
                tickets: [ticket],
                authorizations: [[authorizationId, granter, grantee]],
            };

            // MOCK
            when(
                context.ticketsServiceMock.update(
                    deepEqual({
                        id: ticket,
                    }),
                    deepEqual({
                        transaction_hash: transactionHash,
                        status: 'canceled',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });
            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationId,
                        granter,
                        grantee,
                        mode: 'mint',
                    }),
                    deepEqual({
                        cancelled: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            // TRIGGER
            await context.mintingTasks.onTicketMintingTransactionFailure({ data: input } as Job<
                TicketMintingTransactionFailure
            >);

            // CHECK RETURNs

            // CHECK CALLS
            verify(
                context.ticketsServiceMock.update(
                    deepEqual({
                        id: ticket,
                    }),
                    deepEqual({
                        transaction_hash: transactionHash,
                        status: 'canceled',
                    }),
                ),
            ).once();
            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationId,
                        granter,
                        grantee,
                        mode: 'mint',
                    }),
                    deepEqual({
                        cancelled: true,
                    }),
                ),
            ).once();
        });

        it('should fail on ticket update error', async function() {
            // DECLARE
            const transactionHash = '0xec9d18403c5007f9afb320e21f2c3dc1d6043a680476af13be2f00078d726df6';
            const granter = '0xB9AEc5d0Fcda8ac5377d2481B97B100e75a9FE9B';
            const grantee = '0xcdaD1e850b37372969191E395d2F23d892E6b7c2';
            const ticket = '9134875932764598237645982376459823764598';
            const authorizationId = 'authorization_id';
            const input = {
                transactionHash,
                tickets: [ticket],
                authorizations: [[authorizationId, granter, grantee]],
            };

            // MOCK
            when(
                context.ticketsServiceMock.update(
                    deepEqual({
                        id: ticket,
                    }),
                    deepEqual({
                        transaction_hash: transactionHash,
                        status: 'canceled',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // TRIGGER
            await expect(
                context.mintingTasks.onTicketMintingTransactionFailure({ data: input } as Job<
                    TicketMintingTransactionFailure
                >),
            ).rejects.toMatchObject(
                new NestError(`Error while setting transaction hash and canceled on ticket: unexpected_error`),
            );

            // CHECK RETURNs

            // CHECK CALLS
            verify(
                context.ticketsServiceMock.update(
                    deepEqual({
                        id: ticket,
                    }),
                    deepEqual({
                        transaction_hash: transactionHash,
                        status: 'canceled',
                    }),
                ),
            ).once();
        });

        it('should fail on authorization update error', async function() {
            // DECLARE
            const transactionHash = '0xec9d18403c5007f9afb320e21f2c3dc1d6043a680476af13be2f00078d726df6';
            const granter = '0xB9AEc5d0Fcda8ac5377d2481B97B100e75a9FE9B';
            const grantee = '0xcdaD1e850b37372969191E395d2F23d892E6b7c2';
            const ticket = '9134875932764598237645982376459823764598';
            const authorizationId = 'authorization_id';
            const input = {
                transactionHash,
                tickets: [ticket],
                authorizations: [[authorizationId, granter, grantee]],
            };

            // MOCK
            when(
                context.ticketsServiceMock.update(
                    deepEqual({
                        id: ticket,
                    }),
                    deepEqual({
                        transaction_hash: transactionHash,
                        status: 'canceled',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });
            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationId,
                        granter,
                        grantee,
                        mode: 'mint',
                    }),
                    deepEqual({
                        cancelled: true,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // TRIGGER
            await expect(
                context.mintingTasks.onTicketMintingTransactionFailure({ data: input } as Job<
                    TicketMintingTransactionFailure
                >),
            ).rejects.toMatchObject(new NestError(`Error while setting authorizations to canceled: unexpected_error`));

            // CHECK RETURNs

            // CHECK CALLS
            verify(
                context.ticketsServiceMock.update(
                    deepEqual({
                        id: ticket,
                    }),
                    deepEqual({
                        transaction_hash: transactionHash,
                        status: 'canceled',
                    }),
                ),
            ).once();
            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: authorizationId,
                        granter,
                        grantee,
                        mode: 'mint',
                    }),
                    deepEqual({
                        cancelled: true,
                    }),
                ),
            ).once();
        });
    });

    describe('onTicketMintingTransactionConfirmation', function() {
        it('should properly update authorizations and tickets', async function() {
            // DECLARE
            const transactionHash = '0xec9d18403c5007f9afb320e21f2c3dc1d6043a680476af13be2f00078d726df6';
            const granter = '0xB9AEc5d0Fcda8ac5377d2481B97B100e75a9FE9B';
            const grantee = '0xcdaD1e850b37372969191E395d2F23d892E6b7c2';
            const ticket = '9134875932764598237645982376459823764598';
            const authorizationId = 'authorization_id';
            const input = {
                transactionHash,
                tickets: [ticket],
                authorizations: [[authorizationId, granter, grantee]],
            };

            // MOCK
            when(
                context.ticketsServiceMock.update(
                    deepEqual({
                        id: ticket,
                    }),
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            // TRIGGER
            await context.mintingTasks.onTicketMintingTransactionConfirmation({ data: input } as Job<
                TicketMintingTransactionFailure
            >);

            // CHECK RETURNs

            // CHECK CALLS
            verify(
                context.ticketsServiceMock.update(
                    deepEqual({
                        id: ticket,
                    }),
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).once();
        });

        it('should fail on ticket update error', async function() {
            // DECLARE
            const transactionHash = '0xec9d18403c5007f9afb320e21f2c3dc1d6043a680476af13be2f00078d726df6';
            const granter = '0xB9AEc5d0Fcda8ac5377d2481B97B100e75a9FE9B';
            const grantee = '0xcdaD1e850b37372969191E395d2F23d892E6b7c2';
            const ticket = '9134875932764598237645982376459823764598';
            const authorizationId = 'authorization_id';
            const input = {
                transactionHash,
                tickets: [ticket],
                authorizations: [[authorizationId, granter, grantee]],
            };

            // MOCK
            when(
                context.ticketsServiceMock.update(
                    deepEqual({
                        id: ticket,
                    }),
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // TRIGGER
            await expect(
                context.mintingTasks.onTicketMintingTransactionConfirmation({ data: input } as Job<
                    TicketMintingTransactionFailure
                >),
            ).rejects.toMatchObject(new NestError(`Error while setting transaction hash on ticket: unexpected_error`));

            // CHECK RETURNs

            // CHECK CALLS
            verify(
                context.ticketsServiceMock.update(
                    deepEqual({
                        id: ticket,
                    }),
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).once();
        });
    });
});
