import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { Job, JobOptions } from 'bull';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { AuthorizationsService } from '@lib/common/authorizations/Authorizations.service';
import {
    AuthorizationsTasks,
    GenerateMintingAuthorizationsTaskInput,
}                                                             from '@app/worker/tasks/authorizations/Authorizations.tasks';
import { deepEqual, instance, mock, verify, when }            from 'ts-mockito';
import { Test, TestingModule }                                from '@nestjs/testing';
import { getQueueToken }                                      from '@nestjs/bull';
import { AuthorizedTicketMintingFormat, TicketMintingFormat } from '@lib/common/utils/Cart.type';
import { Price }                                              from '@lib/common/currencies/Currencies.service';
import { DAY, HOUR }                                          from '@lib/common/utils/time';
import { UserDto }                                            from '@lib/common/users/dto/User.dto';
import { CategoryEntity }                                     from '@lib/common/categories/entities/Category.entity';
import { MintAuthorization, toB32 }                           from '@common/global';
import { AuthorizationEntity }                                from '@lib/common/authorizations/entities/Authorization.entity';
import { NestError }                                          from '@lib/common/utils/NestError';

class QueueMock<T = any> {
    add(name: string, data: T, opts?: JobOptions): Promise<Job<T>> {
        return null;
    }
}

describe('Authorization Tasks', function() {
    const context: {
        authorizationTasks: AuthorizationsTasks;
        actionSetsServiceMock: ActionSetsService;
        authorizationQueueMock: QueueMock;
        outrospectionServiceMock: OutrospectionService;
        shutdownServiceMock: ShutdownService;
        categoriesServiceMock: CategoriesService;
        authorizationsServiceMock: AuthorizationsService;
    } = {
        authorizationTasks: null,
        actionSetsServiceMock: null,
        authorizationQueueMock: null,
        outrospectionServiceMock: null,
        shutdownServiceMock: null,
        categoriesServiceMock: null,
        authorizationsServiceMock: null,
    };

    beforeEach(async function() {
        context.actionSetsServiceMock = mock(ActionSetsService);
        context.authorizationsServiceMock = mock(AuthorizationsService);
        context.authorizationQueueMock = mock(QueueMock);
        context.outrospectionServiceMock = mock(OutrospectionService);
        context.shutdownServiceMock = mock(ShutdownService);
        context.categoriesServiceMock = mock(CategoriesService);
        context.authorizationsServiceMock = mock(AuthorizationsService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ActionSetsService,
                    useValue: instance(context.actionSetsServiceMock),
                },
                {
                    provide: getQueueToken('authorization'),
                    useValue: instance(context.authorizationQueueMock),
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
                    provide: CategoriesService,
                    useValue: instance(context.categoriesServiceMock),
                },
                {
                    provide: AuthorizationsService,
                    useValue: instance(context.authorizationsServiceMock),
                },
                AuthorizationsTasks,
            ],
        }).compile();

        context.authorizationTasks = module.get<AuthorizationsTasks>(AuthorizationsTasks);
    });

    describe('generateMintingAuthorizationsTask', function() {
        it('should properly generate authorization without oldAuthorizations', async function() {
            const actionSetId = 'actionset_id';

            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const validatedAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseradddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseradddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const oldAuthorizations: AuthorizedTicketMintingFormat[] = null;

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const commitType = 'stripe';

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const grantee: UserDto = {
                id: 'user_id',
                address: '0xuseraddress',
            } as UserDto;

            const fees = ['0'];

            const input: GenerateMintingAuthorizationsTaskInput = {
                actionSetId,
                authorizations,
                oldAuthorizations,
                prices,
                commitType,
                expirationTime,
                signatureReadable,
                grantee,
                fees,
            };

            const job: Job<GenerateMintingAuthorizationsTaskInput> = {
                data: input,
                progress: async () => {},
            } as Job<GenerateMintingAuthorizationsTaskInput>;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_one_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.authorizationsServiceMock.countElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    filter: {
                                        range: {
                                            be_expiration: {
                                                gt: 'now',
                                            },
                                        },
                                    },
                                    must: [
                                        {
                                            term: {
                                                selectors: MintAuthorization.toSelectorFormat('group_id', toB32('vip')),
                                            },
                                        },
                                        {
                                            term: {
                                                cancelled: false,
                                            },
                                        },
                                        {
                                            term: {
                                                consumed: false,
                                            },
                                        },
                                        {
                                            term: {
                                                dispatched: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    count: 3,
                    _shards: {
                        total: 1,
                        successful: 1,
                        skipped: 0,
                        failed: 0,
                    },
                },
            });

            when(
                context.authorizationsServiceMock.validateTicketAuthorizations(
                    deepEqual(authorizations),
                    deepEqual(prices),
                    fees,
                    expirationTime,
                    grantee.address,
                    signatureReadable,
                ),
            ).thenResolve({
                error: null,
                response: validatedAuthorizations,
            });

            when(
                context.actionSetsServiceMock.updateAction(
                    actionSetId,
                    2,
                    deepEqual({
                        commitType,
                        total: prices,
                        authorizations: validatedAuthorizations,
                        fees,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.authorizationTasks.generateMintingAuthorizationsTask(job);

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.countElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    filter: {
                                        range: {
                                            be_expiration: {
                                                gt: 'now',
                                            },
                                        },
                                    },
                                    must: [
                                        {
                                            term: {
                                                selectors: MintAuthorization.toSelectorFormat('group_id', toB32('vip')),
                                            },
                                        },
                                        {
                                            term: {
                                                cancelled: false,
                                            },
                                        },
                                        {
                                            term: {
                                                consumed: false,
                                            },
                                        },
                                        {
                                            term: {
                                                dispatched: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.validateTicketAuthorizations(
                    deepEqual(authorizations),
                    deepEqual(prices),
                    fees,
                    expirationTime,
                    grantee.address,
                    signatureReadable,
                ),
            ).called();

            verify(
                context.actionSetsServiceMock.updateAction(
                    actionSetId,
                    2,
                    deepEqual({
                        commitType,
                        total: prices,
                        authorizations: validatedAuthorizations,
                        fees,
                    }),
                ),
            ).called();
        });

        it('should properly generate authorization with matching oldAuthorizations', async function() {
            const actionSetId = 'actionset_id';

            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const oldAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseradddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseradddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const commitType = 'stripe';

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const grantee: UserDto = {
                id: 'user_id',
                address: '0xuseraddress',
            } as UserDto;

            const fees = ['0'];

            const input: GenerateMintingAuthorizationsTaskInput = {
                actionSetId,
                authorizations,
                oldAuthorizations,
                prices,
                commitType,
                expirationTime,
                signatureReadable,
                grantee,
                fees,
            };

            const job: Job<GenerateMintingAuthorizationsTaskInput> = {
                data: input,
                progress: async () => {},
            } as Job<GenerateMintingAuthorizationsTaskInput>;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_one_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            await context.authorizationTasks.generateMintingAuthorizationsTask(job);

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).called();
        });

        it('should properly generate authorization with non-matching oldAuthorizations', async function() {
            const actionSetId = 'actionset_id';

            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const validatedAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_one_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_two_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const oldAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_one_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_two_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_two_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const pricesWithFees = [
                {
                    currency: '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8',
                    value: '100',
                    log_value: 0,
                    fee: '0',
                },
            ];

            const commitType = 'stripe';

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const grantee: UserDto = {
                id: 'user_id',
                address: '0xuseraddress',
            } as UserDto;

            const authorizationEntities: { [key: string]: AuthorizationEntity } = {
                authorization_one_id: {
                    id: 'authorization_one_id',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    mode: 'mint',
                    codes: MintAuthorization.toCodesFormat('123'),
                    selectors: MintAuthorization.toSelectorFormat('group_id', 'vip'),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices(pricesWithFees),
                        'group_id',
                        'vip',
                        '123',
                        Math.floor((Date.now() + expirationTime) / 1000),
                    ),
                    signature: '0xsignature',
                    readable_signature: false,
                    cancelled: false,
                    dispatched: false,
                    consumed: false,
                    user_expiration: new Date(Date.now() + expirationTime),
                    be_expiration: new Date(Date.now() + expirationTime + HOUR),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
                authorization_two_id: {
                    id: 'authorization_two_id',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    mode: 'mint',
                    codes: MintAuthorization.toCodesFormat('124'),
                    selectors: MintAuthorization.toSelectorFormat('group_id', 'vip'),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices(pricesWithFees),
                        'group_id',
                        'vip',
                        '124',
                        Math.floor((Date.now() + expirationTime) / 1000),
                    ),
                    signature: '0xsignature',
                    readable_signature: false,
                    cancelled: false,
                    dispatched: false,
                    consumed: false,
                    user_expiration: new Date(Date.now() + expirationTime),
                    be_expiration: new Date(Date.now() + expirationTime + HOUR),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
            };

            const fees = ['0'];

            const input: GenerateMintingAuthorizationsTaskInput = {
                actionSetId,
                authorizations,
                oldAuthorizations,
                prices,
                commitType,
                expirationTime,
                signatureReadable,
                grantee,
                fees,
            };

            const job: Job<GenerateMintingAuthorizationsTaskInput> = {
                data: input,
                progress: async () => {},
            } as Job<GenerateMintingAuthorizationsTaskInput>;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_one_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_two_id',
                        seats: 10,
                        reserved: 5,
                        category_name: 'vip_extra',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_one_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationEntities['authorization_one_id']],
            });

            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_one_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_two_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationEntities['authorization_two_id']],
            });

            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_two_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.authorizationsServiceMock.countElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    filter: {
                                        range: {
                                            be_expiration: {
                                                gt: 'now',
                                            },
                                        },
                                    },
                                    must: [
                                        {
                                            term: {
                                                selectors: MintAuthorization.toSelectorFormat('group_id', toB32('vip')),
                                            },
                                        },
                                        {
                                            term: {
                                                cancelled: false,
                                            },
                                        },
                                        {
                                            term: {
                                                consumed: false,
                                            },
                                        },
                                        {
                                            term: {
                                                dispatched: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    count: 3,
                    _shards: {
                        total: 1,
                        successful: 1,
                        skipped: 0,
                        failed: 0,
                    },
                },
            });

            when(
                context.authorizationsServiceMock.validateTicketAuthorizations(
                    deepEqual(authorizations),
                    deepEqual(prices),
                    fees,
                    expirationTime,
                    grantee.address,
                    signatureReadable,
                ),
            ).thenResolve({
                error: null,
                response: validatedAuthorizations,
            });

            when(
                context.actionSetsServiceMock.updateAction(
                    actionSetId,
                    2,
                    deepEqual({
                        commitType,
                        total: prices,
                        authorizations: validatedAuthorizations,
                        fees,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.authorizationTasks.generateMintingAuthorizationsTask(job);

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).called();

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_one_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_one_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_two_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_two_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.countElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    filter: {
                                        range: {
                                            be_expiration: {
                                                gt: 'now',
                                            },
                                        },
                                    },
                                    must: [
                                        {
                                            term: {
                                                selectors: MintAuthorization.toSelectorFormat('group_id', toB32('vip')),
                                            },
                                        },
                                        {
                                            term: {
                                                cancelled: false,
                                            },
                                        },
                                        {
                                            term: {
                                                consumed: false,
                                            },
                                        },
                                        {
                                            term: {
                                                dispatched: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.validateTicketAuthorizations(
                    deepEqual(authorizations),
                    deepEqual(prices),
                    fees,
                    expirationTime,
                    grantee.address,
                    signatureReadable,
                ),
            ).called();

            verify(
                context.actionSetsServiceMock.updateAction(
                    actionSetId,
                    2,
                    deepEqual({
                        commitType,
                        total: prices,
                        authorizations: validatedAuthorizations,
                        fees,
                    }),
                ),
            ).called();
        });

        it('should fail on category fetch request error', async function() {
            const actionSetId = 'actionset_id';

            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const validatedAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseradddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseradddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const oldAuthorizations: AuthorizedTicketMintingFormat[] = null;

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const commitType = 'stripe';

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const grantee: UserDto = {
                id: 'user_id',
                address: '0xuseraddress',
            } as UserDto;

            const fees = ['0'];

            const input: GenerateMintingAuthorizationsTaskInput = {
                actionSetId,
                authorizations,
                oldAuthorizations,
                prices,
                commitType,
                expirationTime,
                signatureReadable,
                grantee,
                fees,
            };

            const job: Job<GenerateMintingAuthorizationsTaskInput> = {
                data: input,
                progress: async () => {},
            } as Job<GenerateMintingAuthorizationsTaskInput>;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(context.authorizationTasks.generateMintingAuthorizationsTask(job)).rejects.toMatchObject(
                new NestError(`Cannot find category category_one_id`),
            );

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).called();
        });

        it('should fail on empty category fetch request', async function() {
            const actionSetId = 'actionset_id';

            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const validatedAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseradddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseradddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const oldAuthorizations: AuthorizedTicketMintingFormat[] = null;

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const commitType = 'stripe';

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const grantee: UserDto = {
                id: 'user_id',
                address: '0xuseraddress',
            } as UserDto;

            const fees = ['0'];

            const input: GenerateMintingAuthorizationsTaskInput = {
                actionSetId,
                authorizations,
                oldAuthorizations,
                prices,
                commitType,
                expirationTime,
                signatureReadable,
                grantee,
                fees,
            };

            const job: Job<GenerateMintingAuthorizationsTaskInput> = {
                data: input,
                progress: async () => {},
            } as Job<GenerateMintingAuthorizationsTaskInput>;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            await expect(context.authorizationTasks.generateMintingAuthorizationsTask(job)).rejects.toMatchObject(
                new NestError(`Cannot find category category_one_id`),
            );

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).called();
        });

        it('should fail on old authorization fetch request error', async function() {
            const actionSetId = 'actionset_id';

            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const oldAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_two_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseradddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const commitType = 'stripe';

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const grantee: UserDto = {
                id: 'user_id',
                address: '0xuseraddress',
            } as UserDto;

            const fees = ['0'];

            const input: GenerateMintingAuthorizationsTaskInput = {
                actionSetId,
                authorizations,
                oldAuthorizations,
                prices,
                commitType,
                expirationTime,
                signatureReadable,
                grantee,
                fees,
            };

            const job: Job<GenerateMintingAuthorizationsTaskInput> = {
                data: input,
                progress: async () => {},
            } as Job<GenerateMintingAuthorizationsTaskInput>;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_one_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(context.authorizationTasks.generateMintingAuthorizationsTask(job)).rejects.toMatchObject(
                new NestError(`Cannot find category category_two_id`),
            );

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).called();

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).called();
        });

        it('should fail on empty category fetch request error', async function() {
            const actionSetId = 'actionset_id';

            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const oldAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_two_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseradddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const commitType = 'stripe';

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const grantee: UserDto = {
                id: 'user_id',
                address: '0xuseraddress',
            } as UserDto;

            const fees = ['0'];

            const input: GenerateMintingAuthorizationsTaskInput = {
                actionSetId,
                authorizations,
                oldAuthorizations,
                prices,
                commitType,
                expirationTime,
                signatureReadable,
                grantee,
                fees,
            };

            const job: Job<GenerateMintingAuthorizationsTaskInput> = {
                data: input,
                progress: async () => {},
            } as Job<GenerateMintingAuthorizationsTaskInput>;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_one_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            await expect(context.authorizationTasks.generateMintingAuthorizationsTask(job)).rejects.toMatchObject(
                new NestError(`Cannot find category category_two_id`),
            );

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).called();

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).called();
        });

        it('should fail on authorization fetch error when trying to release authorizations', async function() {
            const actionSetId = 'actionset_id';

            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const validatedAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_one_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_two_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const oldAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_one_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_two_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_two_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const commitType = 'stripe';

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const grantee: UserDto = {
                id: 'user_id',
                address: '0xuseraddress',
            } as UserDto;

            const pricesWithFees = [
                {
                    currency: '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8',
                    value: '100',
                    log_value: 0,
                    fee: '0',
                },
            ];

            const authorizationEntities: { [key: string]: AuthorizationEntity } = {
                authorization_one_id: {
                    id: 'authorization_one_id',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    mode: 'mint',
                    codes: MintAuthorization.toCodesFormat('123'),
                    selectors: MintAuthorization.toSelectorFormat('group_id', 'vip'),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices(pricesWithFees),
                        'group_id',
                        'vip',
                        '123',
                        Math.floor((Date.now() + expirationTime) / 1000),
                    ),
                    signature: '0xsignature',
                    readable_signature: false,
                    cancelled: false,
                    dispatched: false,
                    consumed: false,
                    user_expiration: new Date(Date.now() + expirationTime),
                    be_expiration: new Date(Date.now() + expirationTime + HOUR),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
                authorization_two_id: {
                    id: 'authorization_two_id',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    mode: 'mint',
                    codes: MintAuthorization.toCodesFormat('124'),
                    selectors: MintAuthorization.toSelectorFormat('group_id', 'vip'),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices(pricesWithFees),
                        'group_id',
                        'vip',
                        '124',
                        Math.floor((Date.now() + expirationTime) / 1000),
                    ),
                    signature: '0xsignature',
                    readable_signature: false,
                    cancelled: false,
                    dispatched: false,
                    consumed: false,
                    user_expiration: new Date(Date.now() + expirationTime),
                    be_expiration: new Date(Date.now() + expirationTime + HOUR),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
            };

            const fees = ['0'];

            const input: GenerateMintingAuthorizationsTaskInput = {
                actionSetId,
                authorizations,
                oldAuthorizations,
                prices,
                commitType,
                expirationTime,
                signatureReadable,
                grantee,
                fees,
            };

            const job: Job<GenerateMintingAuthorizationsTaskInput> = {
                data: input,
                progress: async () => {},
            } as Job<GenerateMintingAuthorizationsTaskInput>;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_one_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_two_id',
                        seats: 10,
                        reserved: 5,
                        category_name: 'vip_extra',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_one_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(context.authorizationTasks.generateMintingAuthorizationsTask(job)).rejects.toMatchObject(
                new NestError(`Cannot find authorization authorization_one_id`),
            );

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).called();

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_one_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).called();
        });

        it('should fail on authorization empty fetch when trying to release authorizations', async function() {
            const actionSetId = 'actionset_id';

            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const validatedAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_one_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_two_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const oldAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_one_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_two_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_two_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const commitType = 'stripe';

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const grantee: UserDto = {
                id: 'user_id',
                address: '0xuseraddress',
            } as UserDto;

            const pricesWithFees = [
                {
                    currency: '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8',
                    value: '100',
                    log_value: 0,
                    fee: '0',
                },
            ];

            const authorizationEntities: { [key: string]: AuthorizationEntity } = {
                authorization_one_id: {
                    id: 'authorization_one_id',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    mode: 'mint',
                    codes: MintAuthorization.toCodesFormat('123'),
                    selectors: MintAuthorization.toSelectorFormat('group_id', 'vip'),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices(pricesWithFees),
                        'group_id',
                        'vip',
                        '123',
                        Math.floor((Date.now() + expirationTime) / 1000),
                    ),
                    signature: '0xsignature',
                    readable_signature: false,
                    cancelled: false,
                    dispatched: false,
                    consumed: false,
                    user_expiration: new Date(Date.now() + expirationTime),
                    be_expiration: new Date(Date.now() + expirationTime + HOUR),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
                authorization_two_id: {
                    id: 'authorization_two_id',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    mode: 'mint',
                    codes: MintAuthorization.toCodesFormat('124'),
                    selectors: MintAuthorization.toSelectorFormat('group_id', 'vip'),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices(pricesWithFees),
                        'group_id',
                        'vip',
                        '124',
                        Math.floor((Date.now() + expirationTime) / 1000),
                    ),
                    signature: '0xsignature',
                    readable_signature: false,
                    cancelled: false,
                    dispatched: false,
                    consumed: false,
                    user_expiration: new Date(Date.now() + expirationTime),
                    be_expiration: new Date(Date.now() + expirationTime + HOUR),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
            };

            const fees = ['0'];

            const input: GenerateMintingAuthorizationsTaskInput = {
                actionSetId,
                authorizations,
                oldAuthorizations,
                prices,
                commitType,
                expirationTime,
                signatureReadable,
                grantee,
                fees,
            };

            const job: Job<GenerateMintingAuthorizationsTaskInput> = {
                data: input,
                progress: async () => {},
            } as Job<GenerateMintingAuthorizationsTaskInput>;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_one_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_two_id',
                        seats: 10,
                        reserved: 5,
                        category_name: 'vip_extra',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_one_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            await expect(context.authorizationTasks.generateMintingAuthorizationsTask(job)).rejects.toMatchObject(
                new NestError(`Cannot find authorization authorization_one_id`),
            );

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).called();

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_one_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).called();
        });

        it('should fail on authorization cancellation error', async function() {
            const actionSetId = 'actionset_id';

            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const validatedAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_one_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_two_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const oldAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_one_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_two_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_two_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const commitType = 'stripe';

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const grantee: UserDto = {
                id: 'user_id',
                address: '0xuseraddress',
            } as UserDto;

            const pricesWithFees = [
                {
                    currency: '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8',
                    value: '100',
                    log_value: 0,
                    fee: '0',
                },
            ];

            const authorizationEntities: { [key: string]: AuthorizationEntity } = {
                authorization_one_id: {
                    id: 'authorization_one_id',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    mode: 'mint',
                    codes: MintAuthorization.toCodesFormat('123'),
                    selectors: MintAuthorization.toSelectorFormat('group_id', 'vip'),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices(pricesWithFees),
                        'group_id',
                        'vip',
                        '123',
                        Math.floor((Date.now() + expirationTime) / 1000),
                    ),
                    signature: '0xsignature',
                    readable_signature: false,
                    cancelled: false,
                    dispatched: false,
                    consumed: false,
                    user_expiration: new Date(Date.now() + expirationTime),
                    be_expiration: new Date(Date.now() + expirationTime + HOUR),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
                authorization_two_id: {
                    id: 'authorization_two_id',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    mode: 'mint',
                    codes: MintAuthorization.toCodesFormat('124'),
                    selectors: MintAuthorization.toSelectorFormat('group_id', 'vip'),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices(pricesWithFees),
                        'group_id',
                        'vip',
                        '124',
                        Math.floor((Date.now() + expirationTime) / 1000),
                    ),
                    signature: '0xsignature',
                    readable_signature: false,
                    cancelled: false,
                    dispatched: false,
                    consumed: false,
                    user_expiration: new Date(Date.now() + expirationTime),
                    be_expiration: new Date(Date.now() + expirationTime + HOUR),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
            };

            const fees = ['0'];

            const input: GenerateMintingAuthorizationsTaskInput = {
                actionSetId,
                authorizations,
                oldAuthorizations,
                prices,
                commitType,
                expirationTime,
                signatureReadable,
                grantee,
                fees,
            };

            const job: Job<GenerateMintingAuthorizationsTaskInput> = {
                data: input,
                progress: async () => {},
            } as Job<GenerateMintingAuthorizationsTaskInput>;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_one_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_two_id',
                        seats: 10,
                        reserved: 5,
                        category_name: 'vip_extra',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_one_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationEntities['authorization_one_id']],
            });

            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_one_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(context.authorizationTasks.generateMintingAuthorizationsTask(job)).rejects.toMatchObject(
                new NestError('Cannot cancel authorization authorization_one_id'),
            );

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).called();

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_one_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_one_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).called();
        });

        it('should fail on readable signatures', async function() {
            const actionSetId = 'actionset_id';

            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const validatedAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_one_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_two_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const oldAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_one_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_two_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_two_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const commitType = 'stripe';

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const grantee: UserDto = {
                id: 'user_id',
                address: '0xuseraddress',
            } as UserDto;

            const pricesWithFees = [
                {
                    currency: '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8',
                    value: '100',
                    log_value: 0,
                    fee: '0',
                },
            ];

            const authorizationEntities: { [key: string]: AuthorizationEntity } = {
                authorization_one_id: {
                    id: 'authorization_one_id',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    mode: 'mint',
                    codes: MintAuthorization.toCodesFormat('123'),
                    selectors: MintAuthorization.toSelectorFormat('group_id', 'vip'),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices(pricesWithFees),
                        'group_id',
                        'vip',
                        '123',
                        Math.floor((Date.now() + expirationTime) / 1000),
                    ),
                    signature: '0xsignature',
                    readable_signature: true,
                    cancelled: false,
                    dispatched: false,
                    consumed: false,
                    user_expiration: new Date(Date.now() + expirationTime),
                    be_expiration: new Date(Date.now() + expirationTime + HOUR),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
                authorization_two_id: {
                    id: 'authorization_two_id',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    mode: 'mint',
                    codes: MintAuthorization.toCodesFormat('124'),
                    selectors: MintAuthorization.toSelectorFormat('group_id', 'vip'),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices(pricesWithFees),
                        'group_id',
                        'vip',
                        '124',
                        Math.floor((Date.now() + expirationTime) / 1000),
                    ),
                    signature: '0xsignature',
                    readable_signature: false,
                    cancelled: false,
                    dispatched: false,
                    consumed: false,
                    user_expiration: new Date(Date.now() + expirationTime),
                    be_expiration: new Date(Date.now() + expirationTime + HOUR),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
            };

            const fees = ['0'];

            const input: GenerateMintingAuthorizationsTaskInput = {
                actionSetId,
                authorizations,
                oldAuthorizations,
                prices,
                commitType,
                expirationTime,
                signatureReadable,
                grantee,
                fees,
            };

            const job: Job<GenerateMintingAuthorizationsTaskInput> = {
                data: input,
                progress: async () => {},
            } as Job<GenerateMintingAuthorizationsTaskInput>;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_one_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_two_id',
                        seats: 10,
                        reserved: 5,
                        category_name: 'vip_extra',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_one_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationEntities['authorization_one_id']],
            });

            await expect(context.authorizationTasks.generateMintingAuthorizationsTask(job)).rejects.toMatchObject(
                new NestError(
                    'Cannot cancel authorization authorization_one_id with public signature: wait for natural expiration',
                ),
            );

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).called();

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_one_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).called();
        });

        it('should fail on remaining seat fetch error', async function() {
            const actionSetId = 'actionset_id';

            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const validatedAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_one_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_two_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const oldAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_one_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_two_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_two_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const commitType = 'stripe';

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const grantee: UserDto = {
                id: 'user_id',
                address: '0xuseraddress',
            } as UserDto;

            const pricesWithFees = [
                {
                    currency: '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8',
                    value: '100',
                    log_value: 0,
                    fee: '0',
                },
            ];

            const authorizationEntities: { [key: string]: AuthorizationEntity } = {
                authorization_one_id: {
                    id: 'authorization_one_id',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    mode: 'mint',
                    codes: MintAuthorization.toCodesFormat('123'),
                    selectors: MintAuthorization.toSelectorFormat('group_id', 'vip'),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices(pricesWithFees),
                        'group_id',
                        'vip',
                        '123',
                        Math.floor((Date.now() + expirationTime) / 1000),
                    ),
                    signature: '0xsignature',
                    readable_signature: false,
                    cancelled: false,
                    dispatched: false,
                    consumed: false,
                    user_expiration: new Date(Date.now() + expirationTime),
                    be_expiration: new Date(Date.now() + expirationTime + HOUR),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
                authorization_two_id: {
                    id: 'authorization_two_id',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    mode: 'mint',
                    codes: MintAuthorization.toCodesFormat('124'),
                    selectors: MintAuthorization.toSelectorFormat('group_id', 'vip'),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices(pricesWithFees),
                        'group_id',
                        'vip',
                        '124',
                        Math.floor((Date.now() + expirationTime) / 1000),
                    ),
                    signature: '0xsignature',
                    readable_signature: false,
                    cancelled: false,
                    dispatched: false,
                    consumed: false,
                    user_expiration: new Date(Date.now() + expirationTime),
                    be_expiration: new Date(Date.now() + expirationTime + HOUR),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
            };

            const fees = ['0'];

            const input: GenerateMintingAuthorizationsTaskInput = {
                actionSetId,
                authorizations,
                oldAuthorizations,
                prices,
                commitType,
                expirationTime,
                signatureReadable,
                grantee,
                fees,
            };

            const job: Job<GenerateMintingAuthorizationsTaskInput> = {
                data: input,
                progress: async () => {},
            } as Job<GenerateMintingAuthorizationsTaskInput>;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_one_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_two_id',
                        seats: 10,
                        reserved: 5,
                        category_name: 'vip_extra',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_one_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationEntities['authorization_one_id']],
            });

            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_one_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_two_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationEntities['authorization_two_id']],
            });

            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_two_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.authorizationsServiceMock.countElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    filter: {
                                        range: {
                                            be_expiration: {
                                                gt: 'now',
                                            },
                                        },
                                    },
                                    must: [
                                        {
                                            term: {
                                                selectors: MintAuthorization.toSelectorFormat('group_id', toB32('vip')),
                                            },
                                        },
                                        {
                                            term: {
                                                cancelled: false,
                                            },
                                        },
                                        {
                                            term: {
                                                consumed: false,
                                            },
                                        },
                                        {
                                            term: {
                                                dispatched: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(context.authorizationTasks.generateMintingAuthorizationsTask(job)).rejects.toMatchObject(
                new NestError('Error while fetching authorizations count'),
            );

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).called();

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_one_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_one_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_two_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_two_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.countElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    filter: {
                                        range: {
                                            be_expiration: {
                                                gt: 'now',
                                            },
                                        },
                                    },
                                    must: [
                                        {
                                            term: {
                                                selectors: MintAuthorization.toSelectorFormat('group_id', toB32('vip')),
                                            },
                                        },
                                        {
                                            term: {
                                                cancelled: false,
                                            },
                                        },
                                        {
                                            term: {
                                                consumed: false,
                                            },
                                        },
                                        {
                                            term: {
                                                dispatched: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).called();
        });

        it('should fail on authorizations creationg error', async function() {
            const actionSetId = 'actionset_id';

            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const validatedAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_one_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_two_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const oldAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_one_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_two_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_two_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const commitType = 'stripe';

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const grantee: UserDto = {
                id: 'user_id',
                address: '0xuseraddress',
            } as UserDto;

            const pricesWithFees = [
                {
                    currency: '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8',
                    value: '100',
                    log_value: 0,
                    fee: '0',
                },
            ];

            const authorizationEntities: { [key: string]: AuthorizationEntity } = {
                authorization_one_id: {
                    id: 'authorization_one_id',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    mode: 'mint',
                    codes: MintAuthorization.toCodesFormat('123'),
                    selectors: MintAuthorization.toSelectorFormat('group_id', 'vip'),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices(pricesWithFees),
                        'group_id',
                        'vip',
                        '123',
                        Math.floor((Date.now() + expirationTime) / 1000),
                    ),
                    signature: '0xsignature',
                    readable_signature: false,
                    cancelled: false,
                    dispatched: false,
                    consumed: false,
                    user_expiration: new Date(Date.now() + expirationTime),
                    be_expiration: new Date(Date.now() + expirationTime + HOUR),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
                authorization_two_id: {
                    id: 'authorization_two_id',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    mode: 'mint',
                    codes: MintAuthorization.toCodesFormat('124'),
                    selectors: MintAuthorization.toSelectorFormat('group_id', 'vip'),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices(pricesWithFees),
                        'group_id',
                        'vip',
                        '124',
                        Math.floor((Date.now() + expirationTime) / 1000),
                    ),
                    signature: '0xsignature',
                    readable_signature: false,
                    cancelled: false,
                    dispatched: false,
                    consumed: false,
                    user_expiration: new Date(Date.now() + expirationTime),
                    be_expiration: new Date(Date.now() + expirationTime + HOUR),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
            };

            const fees = ['0'];

            const input: GenerateMintingAuthorizationsTaskInput = {
                actionSetId,
                authorizations,
                oldAuthorizations,
                prices,
                commitType,
                expirationTime,
                signatureReadable,
                grantee,
                fees,
            };

            const job: Job<GenerateMintingAuthorizationsTaskInput> = {
                data: input,
                progress: async () => {},
            } as Job<GenerateMintingAuthorizationsTaskInput>;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_one_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_two_id',
                        seats: 10,
                        reserved: 5,
                        category_name: 'vip_extra',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_one_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationEntities['authorization_one_id']],
            });

            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_one_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_two_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationEntities['authorization_two_id']],
            });

            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_two_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.authorizationsServiceMock.countElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    filter: {
                                        range: {
                                            be_expiration: {
                                                gt: 'now',
                                            },
                                        },
                                    },
                                    must: [
                                        {
                                            term: {
                                                selectors: MintAuthorization.toSelectorFormat('group_id', toB32('vip')),
                                            },
                                        },
                                        {
                                            term: {
                                                cancelled: false,
                                            },
                                        },
                                        {
                                            term: {
                                                consumed: false,
                                            },
                                        },
                                        {
                                            term: {
                                                dispatched: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    count: 3,
                    _shards: {
                        total: 1,
                        successful: 1,
                        skipped: 0,
                        failed: 0,
                    },
                },
            });

            when(
                context.authorizationsServiceMock.validateTicketAuthorizations(
                    deepEqual(authorizations),
                    deepEqual(prices),
                    fees,
                    expirationTime,
                    grantee.address,
                    signatureReadable,
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(context.authorizationTasks.generateMintingAuthorizationsTask(job)).rejects.toMatchObject(
                new NestError('Error while creating authorizations'),
            );

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).called();

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_one_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_one_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_two_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_two_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.countElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    filter: {
                                        range: {
                                            be_expiration: {
                                                gt: 'now',
                                            },
                                        },
                                    },
                                    must: [
                                        {
                                            term: {
                                                selectors: MintAuthorization.toSelectorFormat('group_id', toB32('vip')),
                                            },
                                        },
                                        {
                                            term: {
                                                cancelled: false,
                                            },
                                        },
                                        {
                                            term: {
                                                consumed: false,
                                            },
                                        },
                                        {
                                            term: {
                                                dispatched: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.validateTicketAuthorizations(
                    deepEqual(authorizations),
                    deepEqual(prices),
                    fees,
                    expirationTime,
                    grantee.address,
                    signatureReadable,
                ),
            ).called();
        });

        it('should fail on action set update error', async function() {
            const actionSetId = 'actionset_id';

            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const validatedAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_one_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_two_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const oldAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_one_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_two_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_two_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const commitType = 'stripe';

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const grantee: UserDto = {
                id: 'user_id',
                address: '0xuseraddress',
            } as UserDto;

            const pricesWithFees = [
                {
                    currency: '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8',
                    value: '100',
                    log_value: 0,
                    fee: '0',
                },
            ];

            const authorizationEntities: { [key: string]: AuthorizationEntity } = {
                authorization_one_id: {
                    id: 'authorization_one_id',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    mode: 'mint',
                    codes: MintAuthorization.toCodesFormat('123'),
                    selectors: MintAuthorization.toSelectorFormat('group_id', 'vip'),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices(pricesWithFees),
                        'group_id',
                        'vip',
                        '123',
                        Math.floor((Date.now() + expirationTime) / 1000),
                    ),
                    signature: '0xsignature',
                    readable_signature: false,
                    cancelled: false,
                    dispatched: false,
                    consumed: false,
                    user_expiration: new Date(Date.now() + expirationTime),
                    be_expiration: new Date(Date.now() + expirationTime + HOUR),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
                authorization_two_id: {
                    id: 'authorization_two_id',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    mode: 'mint',
                    codes: MintAuthorization.toCodesFormat('124'),
                    selectors: MintAuthorization.toSelectorFormat('group_id', 'vip'),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices(pricesWithFees),
                        'group_id',
                        'vip',
                        '124',
                        Math.floor((Date.now() + expirationTime) / 1000),
                    ),
                    signature: '0xsignature',
                    readable_signature: false,
                    cancelled: false,
                    dispatched: false,
                    consumed: false,
                    user_expiration: new Date(Date.now() + expirationTime),
                    be_expiration: new Date(Date.now() + expirationTime + HOUR),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
            };

            const fees = ['0'];

            const input: GenerateMintingAuthorizationsTaskInput = {
                actionSetId,
                authorizations,
                oldAuthorizations,
                prices,
                commitType,
                expirationTime,
                signatureReadable,
                grantee,
                fees,
            };

            const job: Job<GenerateMintingAuthorizationsTaskInput> = {
                data: input,
                progress: async () => {},
            } as Job<GenerateMintingAuthorizationsTaskInput>;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_one_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_two_id',
                        seats: 10,
                        reserved: 5,
                        category_name: 'vip_extra',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_one_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationEntities['authorization_one_id']],
            });

            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_one_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_two_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationEntities['authorization_two_id']],
            });

            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_two_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.authorizationsServiceMock.countElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    filter: {
                                        range: {
                                            be_expiration: {
                                                gt: 'now',
                                            },
                                        },
                                    },
                                    must: [
                                        {
                                            term: {
                                                selectors: MintAuthorization.toSelectorFormat('group_id', toB32('vip')),
                                            },
                                        },
                                        {
                                            term: {
                                                cancelled: false,
                                            },
                                        },
                                        {
                                            term: {
                                                consumed: false,
                                            },
                                        },
                                        {
                                            term: {
                                                dispatched: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    count: 3,
                    _shards: {
                        total: 1,
                        successful: 1,
                        skipped: 0,
                        failed: 0,
                    },
                },
            });

            when(
                context.authorizationsServiceMock.validateTicketAuthorizations(
                    deepEqual(authorizations),
                    deepEqual(prices),
                    fees,
                    expirationTime,
                    grantee.address,
                    signatureReadable,
                ),
            ).thenResolve({
                error: null,
                response: validatedAuthorizations,
            });

            when(
                context.actionSetsServiceMock.updateAction(
                    actionSetId,
                    2,
                    deepEqual({
                        commitType,
                        total: prices,
                        authorizations: validatedAuthorizations,
                        fees,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(context.authorizationTasks.generateMintingAuthorizationsTask(job)).rejects.toMatchObject(
                new NestError('Error while updating actionSet'),
            );

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).called();

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_one_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_one_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_two_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_two_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.countElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    filter: {
                                        range: {
                                            be_expiration: {
                                                gt: 'now',
                                            },
                                        },
                                    },
                                    must: [
                                        {
                                            term: {
                                                selectors: MintAuthorization.toSelectorFormat('group_id', toB32('vip')),
                                            },
                                        },
                                        {
                                            term: {
                                                cancelled: false,
                                            },
                                        },
                                        {
                                            term: {
                                                consumed: false,
                                            },
                                        },
                                        {
                                            term: {
                                                dispatched: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.validateTicketAuthorizations(
                    deepEqual(authorizations),
                    deepEqual(prices),
                    fees,
                    expirationTime,
                    grantee.address,
                    signatureReadable,
                ),
            ).called();

            verify(
                context.actionSetsServiceMock.updateAction(
                    actionSetId,
                    2,
                    deepEqual({
                        commitType,
                        total: prices,
                        authorizations: validatedAuthorizations,
                        fees,
                    }),
                ),
            ).called();
        });

        it('should properly take into account (multiple) new seats freed by old authorization', async function() {
            const actionSetId = 'actionset_id';

            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
                {
                    categoryId: 'category_two_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const validatedAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_one_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_two_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_two_id',
                    groupId: 'group_id',
                    categoryName: 'vip_extra',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const oldAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_one_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_two_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const commitType = 'stripe';

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const grantee: UserDto = {
                id: 'user_id',
                address: '0xuseraddress',
            } as UserDto;

            const pricesWithFees = [
                {
                    currency: '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8',
                    value: '100',
                    log_value: 0,
                    fee: '0',
                },
            ];

            const authorizationEntities: { [key: string]: AuthorizationEntity } = {
                authorization_one_id: {
                    id: 'authorization_one_id',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    mode: 'mint',
                    codes: MintAuthorization.toCodesFormat('123'),
                    selectors: MintAuthorization.toSelectorFormat('group_id', 'vip'),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices(pricesWithFees),
                        'group_id',
                        'vip',
                        '123',
                        Math.floor((Date.now() + expirationTime) / 1000),
                    ),
                    signature: '0xsignature',
                    readable_signature: false,
                    cancelled: false,
                    dispatched: false,
                    consumed: false,
                    user_expiration: new Date(Date.now() + expirationTime),
                    be_expiration: new Date(Date.now() + expirationTime + HOUR),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
                authorization_two_id: {
                    id: 'authorization_two_id',
                    granter: '0xgranteraddress',
                    grantee: '0xuseraddress',
                    mode: 'mint',
                    codes: MintAuthorization.toCodesFormat('124'),
                    selectors: MintAuthorization.toSelectorFormat('group_id', 'vip'),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices(pricesWithFees),
                        'group_id',
                        'vip',
                        '124',
                        Math.floor((Date.now() + expirationTime) / 1000),
                    ),
                    signature: '0xsignature',
                    readable_signature: false,
                    cancelled: false,
                    dispatched: false,
                    consumed: false,
                    user_expiration: new Date(Date.now() + expirationTime),
                    be_expiration: new Date(Date.now() + expirationTime + HOUR),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
            };

            const fees = ['0'];

            const input: GenerateMintingAuthorizationsTaskInput = {
                actionSetId,
                authorizations,
                oldAuthorizations,
                prices,
                commitType,
                expirationTime,
                signatureReadable,
                grantee,
                fees,
            };

            const job: Job<GenerateMintingAuthorizationsTaskInput> = {
                data: input,
                progress: async () => {},
            } as Job<GenerateMintingAuthorizationsTaskInput>;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_one_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_two_id',
                        seats: 10,
                        reserved: 5,
                        category_name: 'vip_extra',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_one_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationEntities['authorization_one_id']],
            });

            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_one_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_two_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationEntities['authorization_two_id']],
            });

            when(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_two_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.authorizationsServiceMock.countElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    filter: {
                                        range: {
                                            be_expiration: {
                                                gt: 'now',
                                            },
                                        },
                                    },
                                    must: [
                                        {
                                            term: {
                                                selectors: MintAuthorization.toSelectorFormat(
                                                    'group_id',
                                                    toB32('vip_extra'),
                                                ),
                                            },
                                        },
                                        {
                                            term: {
                                                cancelled: false,
                                            },
                                        },
                                        {
                                            term: {
                                                consumed: false,
                                            },
                                        },
                                        {
                                            term: {
                                                dispatched: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    count: 3,
                    _shards: {
                        total: 1,
                        successful: 1,
                        skipped: 0,
                        failed: 0,
                    },
                },
            });

            when(
                context.authorizationsServiceMock.countElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    filter: {
                                        range: {
                                            be_expiration: {
                                                gt: 'now',
                                            },
                                        },
                                    },
                                    must: [
                                        {
                                            term: {
                                                selectors: MintAuthorization.toSelectorFormat('group_id', toB32('vip')),
                                            },
                                        },
                                        {
                                            term: {
                                                cancelled: false,
                                            },
                                        },
                                        {
                                            term: {
                                                consumed: false,
                                            },
                                        },
                                        {
                                            term: {
                                                dispatched: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    count: 3,
                    _shards: {
                        total: 1,
                        successful: 1,
                        skipped: 0,
                        failed: 0,
                    },
                },
            });

            when(
                context.authorizationsServiceMock.validateTicketAuthorizations(
                    deepEqual(authorizations),
                    deepEqual(prices),
                    fees,
                    expirationTime,
                    grantee.address,
                    signatureReadable,
                ),
            ).thenResolve({
                error: null,
                response: validatedAuthorizations,
            });

            when(
                context.actionSetsServiceMock.updateAction(
                    actionSetId,
                    2,
                    deepEqual({
                        commitType,
                        total: prices,
                        authorizations: validatedAuthorizations,
                        fees,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.authorizationTasks.generateMintingAuthorizationsTask(job);

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).called();

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_two_id',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_one_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_one_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: 'authorization_two_id',
                        mode: 'mint',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.update(
                    deepEqual({
                        id: 'authorization_two_id',
                        granter: '0xgranteraddress',
                        grantee: '0xuseraddress',
                        mode: 'mint',
                    }),
                    deepEqual({
                        signature: null,
                        cancelled: true,
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.countElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    filter: {
                                        range: {
                                            be_expiration: {
                                                gt: 'now',
                                            },
                                        },
                                    },
                                    must: [
                                        {
                                            term: {
                                                selectors: MintAuthorization.toSelectorFormat(
                                                    'group_id',
                                                    toB32('vip_extra'),
                                                ),
                                            },
                                        },
                                        {
                                            term: {
                                                cancelled: false,
                                            },
                                        },
                                        {
                                            term: {
                                                consumed: false,
                                            },
                                        },
                                        {
                                            term: {
                                                dispatched: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.countElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    filter: {
                                        range: {
                                            be_expiration: {
                                                gt: 'now',
                                            },
                                        },
                                    },
                                    must: [
                                        {
                                            term: {
                                                selectors: MintAuthorization.toSelectorFormat('group_id', toB32('vip')),
                                            },
                                        },
                                        {
                                            term: {
                                                cancelled: false,
                                            },
                                        },
                                        {
                                            term: {
                                                consumed: false,
                                            },
                                        },
                                        {
                                            term: {
                                                dispatched: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.validateTicketAuthorizations(
                    deepEqual(authorizations),
                    deepEqual(prices),
                    fees,
                    expirationTime,
                    grantee.address,
                    signatureReadable,
                ),
            ).called();

            verify(
                context.actionSetsServiceMock.updateAction(
                    actionSetId,
                    2,
                    deepEqual({
                        commitType,
                        total: prices,
                        authorizations: validatedAuthorizations,
                        fees,
                    }),
                ),
            ).called();
        });

        it('should fail because no seats are left', async function() {
            const actionSetId = 'actionset_id';

            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const validatedAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseradddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseradddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const oldAuthorizations: AuthorizedTicketMintingFormat[] = null;

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const commitType = 'stripe';

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const grantee: UserDto = {
                id: 'user_id',
                address: '0xuseraddress',
            } as UserDto;

            const fees = ['0'];

            const input: GenerateMintingAuthorizationsTaskInput = {
                actionSetId,
                authorizations,
                oldAuthorizations,
                prices,
                commitType,
                expirationTime,
                signatureReadable,
                grantee,
                fees,
            };

            const job: Job<GenerateMintingAuthorizationsTaskInput> = {
                data: input,
                progress: async () => {},
            } as Job<GenerateMintingAuthorizationsTaskInput>;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_one_id',
                        seats: 1,
                        reserved: 0,
                        category_name: 'vip',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.authorizationsServiceMock.countElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    filter: {
                                        range: {
                                            be_expiration: {
                                                gt: 'now',
                                            },
                                        },
                                    },
                                    must: [
                                        {
                                            term: {
                                                selectors: MintAuthorization.toSelectorFormat('group_id', toB32('vip')),
                                            },
                                        },
                                        {
                                            term: {
                                                cancelled: false,
                                            },
                                        },
                                        {
                                            term: {
                                                consumed: false,
                                            },
                                        },
                                        {
                                            term: {
                                                dispatched: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    count: 0,
                    _shards: {
                        total: 1,
                        successful: 1,
                        skipped: 0,
                        failed: 0,
                    },
                },
            });

            when(context.actionSetsServiceMock.errorStep(actionSetId, 'no_seats_left', deepEqual({}), 2)).thenResolve({
                error: null,
                response: null,
            });

            await context.authorizationTasks.generateMintingAuthorizationsTask(job);

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.countElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    filter: {
                                        range: {
                                            be_expiration: {
                                                gt: 'now',
                                            },
                                        },
                                    },
                                    must: [
                                        {
                                            term: {
                                                selectors: MintAuthorization.toSelectorFormat('group_id', toB32('vip')),
                                            },
                                        },
                                        {
                                            term: {
                                                cancelled: false,
                                            },
                                        },
                                        {
                                            term: {
                                                consumed: false,
                                            },
                                        },
                                        {
                                            term: {
                                                dispatched: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).called();

            verify(context.actionSetsServiceMock.errorStep(actionSetId, 'no_seats_left', deepEqual({}), 2)).called();
        });

        it('should fail on actionset update error to signal that no seats are left', async function() {
            const actionSetId = 'actionset_id';

            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const validatedAuthorizations: AuthorizedTicketMintingFormat[] = [
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseradddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
                {
                    categoryId: 'category_one_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_id',
                    groupId: 'group_id',
                    categoryName: 'vip',
                    granter: '0xgranteraddress',
                    grantee: '0xuseradddress',
                    granterController: 'granter_controller_name',
                    expiration: new Date(Date.now() + 2 * DAY),
                },
            ];

            const oldAuthorizations: AuthorizedTicketMintingFormat[] = null;

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const commitType = 'stripe';

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const grantee: UserDto = {
                id: 'user_id',
                address: '0xuseraddress',
            } as UserDto;

            const fees = ['0'];

            const input: GenerateMintingAuthorizationsTaskInput = {
                actionSetId,
                authorizations,
                oldAuthorizations,
                prices,
                commitType,
                expirationTime,
                signatureReadable,
                grantee,
                fees,
            };

            const job: Job<GenerateMintingAuthorizationsTaskInput> = {
                data: input,
                progress: async () => {},
            } as Job<GenerateMintingAuthorizationsTaskInput>;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_one_id',
                        seats: 1,
                        reserved: 0,
                        category_name: 'vip',
                        group_id: 'group_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.authorizationsServiceMock.countElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    filter: {
                                        range: {
                                            be_expiration: {
                                                gt: 'now',
                                            },
                                        },
                                    },
                                    must: [
                                        {
                                            term: {
                                                selectors: MintAuthorization.toSelectorFormat('group_id', toB32('vip')),
                                            },
                                        },
                                        {
                                            term: {
                                                cancelled: false,
                                            },
                                        },
                                        {
                                            term: {
                                                consumed: false,
                                            },
                                        },
                                        {
                                            term: {
                                                dispatched: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    count: 0,
                    _shards: {
                        total: 1,
                        successful: 1,
                        skipped: 0,
                        failed: 0,
                    },
                },
            });

            when(context.actionSetsServiceMock.errorStep(actionSetId, 'no_seats_left', deepEqual({}), 2)).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(context.authorizationTasks.generateMintingAuthorizationsTask(job)).rejects.toMatchObject(
                new NestError(`Error while detecting error on actionset ${actionSetId}`),
            );

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_one_id',
                    }),
                ),
            ).called();

            verify(
                context.authorizationsServiceMock.countElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    filter: {
                                        range: {
                                            be_expiration: {
                                                gt: 'now',
                                            },
                                        },
                                    },
                                    must: [
                                        {
                                            term: {
                                                selectors: MintAuthorization.toSelectorFormat('group_id', toB32('vip')),
                                            },
                                        },
                                        {
                                            term: {
                                                cancelled: false,
                                            },
                                        },
                                        {
                                            term: {
                                                consumed: false,
                                            },
                                        },
                                        {
                                            term: {
                                                dispatched: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).called();

            verify(context.actionSetsServiceMock.errorStep(actionSetId, 'no_seats_left', deepEqual({}), 2)).called();
        });
    });
});
