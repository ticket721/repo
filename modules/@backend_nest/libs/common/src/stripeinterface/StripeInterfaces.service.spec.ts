import { StripeInterfacesService } from './StripeInterfaces.service';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra';
import { StripeInterfacesRepository } from './StripeInterfaces.repository';
import { mock, when, instance, spy, deepEqual, verify } from 'ts-mockito';
import { StripeService } from '../stripe/Stripe.service';
import Stripe from 'stripe';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@iaminfinity/express-cassandra/dist/utils/cassandra-orm.utils';
import { StripeInterfaceEntity } from './entities/StripeInterface.entity';
import { UserDto } from '../users/dto/User.dto';
import { ESSearchReturn } from '../utils/ESSearchReturn.type';
import { TimeToolService } from '../toolbox/Time.tool.service';
import { SECOND } from '../utils/time';

class StripeInterfaceEntityMock {
    public _properties = null;

    search(options: EsSearchOptionsStatic, callback?: (err: any, ret: any) => void): void {
        return;
    }
}

describe('StripeInterfaces Service', function () {
    const context: {
        stripeInterfacesService: StripeInterfacesService;
        stripeInterfaceEntityMock: StripeInterfaceEntityMock;
        stripeInterfacesRepositoryMock: StripeInterfacesRepository;
        stripeServiceMock: StripeService;
        stripeMock: Stripe;
        timeToolServiceMock: TimeToolService;
    } = {
        stripeInterfacesService: null,
        stripeInterfaceEntityMock: null,
        stripeInterfacesRepositoryMock: null,
        stripeServiceMock: null,
        stripeMock: null,
        timeToolServiceMock: null
    };

    beforeEach(async function () {
        context.stripeInterfaceEntityMock = mock(StripeInterfaceEntityMock);
        when(context.stripeInterfaceEntityMock._properties).thenReturn({
            schema: {
                fields: {},
            },
        });
        context.stripeInterfacesRepositoryMock = mock(StripeInterfacesRepository);
        context.stripeServiceMock = mock(StripeService);
        context.stripeMock = mock(Stripe);
        when(context.stripeServiceMock.get()).thenReturn(instance(context.stripeMock));
        context.timeToolServiceMock = mock(TimeToolService);

        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: getModelToken(StripeInterfaceEntity),
                    useValue: instance(context.stripeInterfaceEntityMock),
                },
                {
                    provide: StripeInterfacesRepository,
                    useValue: instance(context.stripeInterfacesRepositoryMock),
                },
                {
                    provide: StripeService,
                    useValue: instance(context.stripeServiceMock),
                },
                {
                    provide: TimeToolService,
                    useValue: instance(context.timeToolServiceMock)
                },
                StripeInterfacesService,
            ],
        }).compile();

        context.stripeInterfacesService = app.get<StripeInterfacesService>(StripeInterfacesService);
    });

    describe('createStripeInterface', function () {

        it('should properly create a stripe interface', async function () {
            const spiedService = spy(context.stripeInterfacesService);

            const user: UserDto = {
                id: 'user_id',
            } as UserDto;

            const stripeInterface: StripeInterfaceEntity = {
                owner: user.id,
                payment_methods: [],
                connect_account: null,
                connect_account_capabilities: null,
                connect_account_current_deadline: null,
                connect_account_currently_due: null,
                connect_account_eventually_due: null,
                connect_account_past_due: null,
                connect_account_pending_verification: null,
                connect_account_errors: null,
                connect_account_external_accounts: null,
                connect_account_name: null,
                connect_account_type: null,
                connect_account_disabled_reason: null,
                connect_account_updated_at: null,
            } as StripeInterfaceEntity;

            when(spiedService.recoverUserInterface(deepEqual(user))).thenResolve({
                error: null,
                response: null,
            });

            when(spiedService.create(deepEqual(stripeInterface))).thenResolve({
                error: null,
                response: stripeInterface,
            });

            const res = await context.stripeInterfacesService.createStripeInterface(user);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(stripeInterface);

            verify(spiedService.recoverUserInterface(deepEqual(user))).times(1);

            verify(spiedService.create(deepEqual(stripeInterface))).times(1);
        });

        it('should fail on interface recovery error', async function () {
            const spiedService = spy(context.stripeInterfacesService);

            const user: UserDto = {
                id: 'user_id',
            } as UserDto;

            const stripeInterface: StripeInterfaceEntity = {
                owner: user.id,
                payment_methods: [],
                connect_account: null,
                connect_account_capabilities: null,
                connect_account_current_deadline: null,
                connect_account_currently_due: null,
                connect_account_eventually_due: null,
                connect_account_past_due: null,
                connect_account_pending_verification: null,
                connect_account_errors: null,
                connect_account_external_accounts: null,
                connect_account_name: null,
                connect_account_type: null,
                connect_account_disabled_reason: null,
                connect_account_updated_at: null,
            } as StripeInterfaceEntity;

            when(spiedService.recoverUserInterface(deepEqual(user))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.stripeInterfacesService.createStripeInterface(user);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(spiedService.recoverUserInterface(deepEqual(user))).times(1);
        });

        it('should fail on already existing interface', async function () {
            const spiedService = spy(context.stripeInterfacesService);

            const user: UserDto = {
                id: 'user_id',
            } as UserDto;

            const stripeInterface: StripeInterfaceEntity = {
                owner: user.id,
                payment_methods: [],
                connect_account: null,
                connect_account_capabilities: null,
                connect_account_current_deadline: null,
                connect_account_currently_due: null,
                connect_account_eventually_due: null,
                connect_account_past_due: null,
                connect_account_pending_verification: null,
                connect_account_errors: null,
                connect_account_external_accounts: null,
                connect_account_name: null,
                connect_account_type: null,
                connect_account_disabled_reason: null,
                connect_account_updated_at: null,
            } as StripeInterfaceEntity;

            when(spiedService.recoverUserInterface(deepEqual(user))).thenResolve({
                error: null,
                response: stripeInterface,
            });

            const res = await context.stripeInterfacesService.createStripeInterface(user);

            expect(res.error).toEqual('user_already_has_connect_account');
            expect(res.response).toEqual(null);

            verify(spiedService.recoverUserInterface(deepEqual(user))).times(1);
        });

        it('should fail on creation error', async function () {
            const spiedService = spy(context.stripeInterfacesService);

            const user: UserDto = {
                id: 'user_id',
            } as UserDto;

            const stripeInterface: StripeInterfaceEntity = {
                owner: user.id,
                payment_methods: [],
                connect_account: null,
                connect_account_capabilities: null,
                connect_account_current_deadline: null,
                connect_account_currently_due: null,
                connect_account_eventually_due: null,
                connect_account_past_due: null,
                connect_account_pending_verification: null,
                connect_account_errors: null,
                connect_account_external_accounts: null,
                connect_account_name: null,
                connect_account_type: null,
                connect_account_disabled_reason: null,
                connect_account_updated_at: null,
            } as StripeInterfaceEntity;

            when(spiedService.recoverUserInterface(deepEqual(user))).thenResolve({
                error: null,
                response: null,
            });

            when(spiedService.create(deepEqual(stripeInterface))).thenResolve({
                error: 'unexpected_error',
                response: stripeInterface,
            });

            const res = await context.stripeInterfacesService.createStripeInterface(user);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(spiedService.recoverUserInterface(deepEqual(user))).times(1);

            verify(spiedService.create(deepEqual(stripeInterface))).times(1);
        });
    });

    describe('recoverUserInterface', function () {
        it('should properly recover a user stripe interface', async function () {
            const spiedService = spy(context.stripeInterfacesService);

            const user: UserDto = {
                id: 'user_id',
            } as UserDto;

            const stripeInterface: StripeInterfaceEntity = {
                owner: user.id,
                payment_methods: [],
                connect_account: null,
                connect_account_capabilities: null,
                connect_account_current_deadline: null,
                connect_account_currently_due: null,
                connect_account_eventually_due: null,
                connect_account_past_due: null,
                connect_account_pending_verification: null,
                connect_account_errors: null,
                connect_account_external_accounts: null,
                connect_account_name: null,
                connect_account_type: null,
                connect_account_disabled_reason: null,
                connect_account_updated_at: null,
            } as StripeInterfaceEntity;

            const esQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    owner: user.id,
                                },
                            },
                        },
                    },
                },
            };

            const esQueryResult: ESSearchReturn<StripeInterfaceEntity> = {
                took: 1,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    failed: 0,
                    skipped: 0,
                },
                hits: {
                    total: 1,
                    max_score: 1,
                    hits: [
                        {
                            _index: 'idx',
                            _id: 'idx',
                            _score: 1,
                            _type: 'type',
                            _source: stripeInterface,
                        },
                    ],
                },
            };

            when(spiedService.searchElastic(deepEqual(esQuery))).thenResolve({
                error: null,
                response: esQueryResult,
            });

            when(spiedService.updateAccountInfos(deepEqual(stripeInterface))).thenResolve({
                error: null,
                response: stripeInterface,
            });

            const res = await context.stripeInterfacesService.recoverUserInterface(user);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(stripeInterface);

            verify(spiedService.searchElastic(deepEqual(esQuery))).times(1);
            verify(spiedService.updateAccountInfos(deepEqual(stripeInterface))).times(1);
        });

        it('should fail on query error', async function () {
            const spiedService = spy(context.stripeInterfacesService);

            const user: UserDto = {
                id: 'user_id',
            } as UserDto;

            const stripeInterface: StripeInterfaceEntity = {
                owner: user.id,
                payment_methods: [],
                connect_account: null,
                connect_account_capabilities: null,
                connect_account_current_deadline: null,
                connect_account_currently_due: null,
                connect_account_eventually_due: null,
                connect_account_past_due: null,
                connect_account_pending_verification: null,
                connect_account_errors: null,
                connect_account_external_accounts: null,
                connect_account_name: null,
                connect_account_type: null,
                connect_account_disabled_reason: null,
                connect_account_updated_at: null,
            } as StripeInterfaceEntity;

            const esQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    owner: user.id,
                                },
                            },
                        },
                    },
                },
            };

            const esQueryResult: ESSearchReturn<StripeInterfaceEntity> = {
                took: 1,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    failed: 0,
                    skipped: 0,
                },
                hits: {
                    total: 1,
                    max_score: 1,
                    hits: [
                        {
                            _index: 'idx',
                            _id: 'idx',
                            _score: 1,
                            _type: 'type',
                            _source: stripeInterface,
                        },
                    ],
                },
            };

            when(spiedService.searchElastic(deepEqual(esQuery))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.stripeInterfacesService.recoverUserInterface(user);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(spiedService.searchElastic(deepEqual(esQuery))).times(1);
        });

        it('should return null when not found', async function () {
            const spiedService = spy(context.stripeInterfacesService);

            const user: UserDto = {
                id: 'user_id',
            } as UserDto;

            const stripeInterface: StripeInterfaceEntity = null;

            const esQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    owner: user.id,
                                },
                            },
                        },
                    },
                },
            };

            const esQueryResult: ESSearchReturn<StripeInterfaceEntity> = {
                took: 1,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    failed: 0,
                    skipped: 0,
                },
                hits: {
                    total: 0,
                    max_score: 1,
                    hits: [],
                },
            };

            when(spiedService.searchElastic(deepEqual(esQuery))).thenResolve({
                error: null,
                response: esQueryResult,
            });

            const res = await context.stripeInterfacesService.recoverUserInterface(user);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(stripeInterface);

            verify(spiedService.searchElastic(deepEqual(esQuery))).times(1);
        });
    });

    describe('recoverBalance', function () {
        it('should properly recover account balance', async function () {
            const spiedService = spy(context.stripeInterfacesService);

            const user: UserDto = {
                id: 'user_id',
            } as UserDto;

            const stripeInterface: StripeInterfaceEntity = {
                owner: user.id,
                payment_methods: [],
                connect_account: null,
                connect_account_capabilities: null,
                connect_account_current_deadline: null,
                connect_account_currently_due: null,
                connect_account_eventually_due: null,
                connect_account_past_due: null,
                connect_account_pending_verification: null,
                connect_account_errors: null,
                connect_account_external_accounts: null,
                connect_account_name: null,
                connect_account_type: null,
                connect_account_disabled_reason: null,
                connect_account_updated_at: null,
            } as StripeInterfaceEntity;

            const stripeBalanceMock = mock(Stripe.BalanceResource);
            const balance: Stripe.Balance = {
                object: 'balance',
                available: [
                    {
                        amount: 100,
                        currency: 'eur',
                    },
                ],
                pending: [
                    {
                        amount: 0,
                        currency: 'eur',
                    },
                ],
                livemode: true,
            };

            when(context.stripeMock.balance).thenReturn(instance(stripeBalanceMock));
            when(
                stripeBalanceMock.retrieve(
                    deepEqual({}),
                    deepEqual({
                        stripeAccount: stripeInterface.connect_account,
                    }),
                ),
            ).thenResolve(balance);

            const res = await context.stripeInterfacesService.recoverBalance(stripeInterface);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(balance);

            verify(context.stripeMock.balance).times(1);
            verify(
                stripeBalanceMock.retrieve(
                    deepEqual({}),
                    deepEqual({
                        stripeAccount: stripeInterface.connect_account,
                    }),
                ),
            ).times(1);
        });

        it('should fail on fetch error', async function () {
            const user: UserDto = {
                id: 'user_id',
            } as UserDto;

            const stripeInterface: StripeInterfaceEntity = {
                owner: user.id,
                payment_methods: [],
                connect_account: null,
                connect_account_capabilities: null,
                connect_account_current_deadline: null,
                connect_account_currently_due: null,
                connect_account_eventually_due: null,
                connect_account_past_due: null,
                connect_account_pending_verification: null,
                connect_account_errors: null,
                connect_account_external_accounts: null,
                connect_account_name: null,
                connect_account_type: null,
                connect_account_disabled_reason: null,
                connect_account_updated_at: null,
            } as StripeInterfaceEntity;

            const stripeBalanceMock = mock(Stripe.BalanceResource);

            when(context.stripeMock.balance).thenReturn(instance(stripeBalanceMock));
            when(
                stripeBalanceMock.retrieve(
                    deepEqual({}),
                    deepEqual({
                        stripeAccount: stripeInterface.connect_account,
                    }),
                ),
            ).thenReject(new Error('Cannot fetch balance'));

            const res = await context.stripeInterfacesService.recoverBalance(stripeInterface);

            expect(res.error).toEqual('Cannot fetch balance');
            expect(res.response).toEqual(null);

            verify(context.stripeMock.balance).times(1);
            verify(
                stripeBalanceMock.retrieve(
                    deepEqual({}),
                    deepEqual({
                        stripeAccount: stripeInterface.connect_account,
                    }),
                ),
            ).times(1);
        });
    });

    describe('createAccount', function () {
        it('should properly create a connect account', async function () {
            const user: UserDto = {
                id: 'user_id',
                email: 'test@test.com',
            } as UserDto;

            const accountToken = 'tok_skdjhskjdfhksjhfd';
            const stripeTokenMock = mock(Stripe.TokensResource);
            const stripeAccountMock = mock(Stripe.AccountsResource);
            const token: Stripe.Token = {
                id: accountToken,
                object: 'token',
                client_ip: 'ip',
                created: 1234,
                livemode: false,
                type: 'account',
                used: false,
            };

            const resultingAccount: Stripe.Account = {
                id: 'acc_sdljfskjdfskdjf',
                object: 'account',
                business_profile: null,
                business_type: null,
                charges_enabled: true,
                country: 'FR',
                default_currency: 'eur',
                details_submitted: false,
                email: user.email,
                payouts_enabled: true,
                settings: null,
                type: 'custom',
            };

            when(context.stripeMock.tokens).thenReturn(instance(stripeTokenMock));
            when(context.stripeMock.accounts).thenReturn(instance(stripeAccountMock));
            when(stripeTokenMock.retrieve(accountToken)).thenResolve(token);
            when(
                stripeAccountMock.create(
                    deepEqual({
                        type: 'custom',
                        email: user.email,
                        requested_capabilities: ['card_payments', 'transfers'],
                        account_token: accountToken,
                        settings: {
                            payouts: {
                                schedule: {
                                    interval: 'manual',
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve(resultingAccount);

            const res = await context.stripeInterfacesService.createAccount(user, accountToken);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(resultingAccount);

            verify(context.stripeMock.tokens).times(1);
            verify(context.stripeMock.accounts).times(1);
            verify(stripeTokenMock.retrieve(accountToken)).times(1);
            verify(
                stripeAccountMock.create(
                    deepEqual({
                        type: 'custom',
                        email: user.email,
                        requested_capabilities: ['card_payments', 'transfers'],
                        account_token: accountToken,
                        settings: {
                            payouts: {
                                schedule: {
                                    interval: 'manual',
                                },
                            },
                        },
                    }),
                ),
            ).times(1);
        });

        it('should fail on token fetch error', async function () {
            const user: UserDto = {
                id: 'user_id',
                email: 'test@test.com',
            } as UserDto;

            const accountToken = 'tok_skdjhskjdfhksjhfd';
            const stripeTokenMock = mock(Stripe.TokensResource);
            when(context.stripeMock.tokens).thenReturn(instance(stripeTokenMock));
            when(stripeTokenMock.retrieve(accountToken)).thenReject(new Error('Cannot retrieve token'));

            const res = await context.stripeInterfacesService.createAccount(user, accountToken);

            expect(res.error).toEqual('cannot_find_token');
            expect(res.response).toEqual(null);

            verify(context.stripeMock.tokens).times(1);
            verify(stripeTokenMock.retrieve(accountToken)).times(1);
        });

        it('should fail on already used token', async function () {
            const user: UserDto = {
                id: 'user_id',
                email: 'test@test.com',
            } as UserDto;

            const accountToken = 'tok_skdjhskjdfhksjhfd';
            const stripeTokenMock = mock(Stripe.TokensResource);
            const token: Stripe.Token = {
                id: accountToken,
                object: 'token',
                client_ip: 'ip',
                created: 1234,
                livemode: false,
                type: 'account',
                used: true,
            };

            when(context.stripeMock.tokens).thenReturn(instance(stripeTokenMock));
            when(stripeTokenMock.retrieve(accountToken)).thenResolve(token);

            const res = await context.stripeInterfacesService.createAccount(user, accountToken);

            expect(res.error).toEqual('token_already_used');
            expect(res.response).toEqual(null);

            verify(context.stripeMock.tokens).times(1);
            verify(stripeTokenMock.retrieve(accountToken)).times(1);
        });

        it('should fail on account creation error', async function () {
            const user: UserDto = {
                id: 'user_id',
                email: 'test@test.com',
            } as UserDto;

            const accountToken = 'tok_skdjhskjdfhksjhfd';
            const stripeTokenMock = mock(Stripe.TokensResource);
            const stripeAccountMock = mock(Stripe.AccountsResource);
            const token: Stripe.Token = {
                id: accountToken,
                object: 'token',
                client_ip: 'ip',
                created: 1234,
                livemode: false,
                type: 'account',
                used: false,
            };

            const resultingAccount: Stripe.Account = {
                id: 'acc_sdljfskjdfskdjf',
                object: 'account',
                business_profile: null,
                business_type: null,
                charges_enabled: true,
                country: 'FR',
                default_currency: 'eur',
                details_submitted: false,
                email: user.email,
                payouts_enabled: true,
                settings: null,
                type: 'custom',
            };

            when(context.stripeMock.tokens).thenReturn(instance(stripeTokenMock));
            when(context.stripeMock.accounts).thenReturn(instance(stripeAccountMock));
            when(stripeTokenMock.retrieve(accountToken)).thenResolve(token);
            when(
                stripeAccountMock.create(
                    deepEqual({
                        type: 'custom',
                        email: user.email,
                        requested_capabilities: ['card_payments', 'transfers'],
                        account_token: accountToken,
                        settings: {
                            payouts: {
                                schedule: {
                                    interval: 'manual',
                                },
                            },
                        },
                    }),
                ),
            ).thenReject(new Error('Cannot create account'));

            const res = await context.stripeInterfacesService.createAccount(user, accountToken);

            expect(res.error).toEqual('cannot_create_account');
            expect(res.response).toEqual(null);

            verify(context.stripeMock.tokens).times(1);
            verify(context.stripeMock.accounts).times(1);
            verify(stripeTokenMock.retrieve(accountToken)).times(1);
            verify(
                stripeAccountMock.create(
                    deepEqual({
                        type: 'custom',
                        email: user.email,
                        requested_capabilities: ['card_payments', 'transfers'],
                        account_token: accountToken,
                        settings: {
                            payouts: {
                                schedule: {
                                    interval: 'manual',
                                },
                            },
                        },
                    }),
                ),
            ).times(1);
        });
    });

    describe('shouldUpdateAccountInfos', function () {
        it('should return false if last update soon enough', async function () {
            const date = new Date(Date.now());

            const stripeInterface: StripeInterfaceEntity = {
                connect_account_updated_at: date
            } as StripeInterfaceEntity;

            when(context.timeToolServiceMock.now()).thenReturn(date);

            expect(context.stripeInterfacesService.shouldUpdateAccountInfos(stripeInterface)).toEqual(false)

            verify(context.timeToolServiceMock.now()).once();

        });

        it('should return true if last update not soon enough', async function () {
            const date = new Date(Date.now());

            const stripeInterface: StripeInterfaceEntity = {
                connect_account_updated_at: new Date(date.getTime() - 6 * SECOND)
            } as StripeInterfaceEntity;

            when(context.timeToolServiceMock.now()).thenReturn(date);

            expect(context.stripeInterfacesService.shouldUpdateAccountInfos(stripeInterface)).toEqual(true)

            verify(context.timeToolServiceMock.now()).once();

        });

        it('should return true if never fetched', async function () {

            const stripeInterface: StripeInterfaceEntity = {
                connect_account_updated_at: null
            } as StripeInterfaceEntity;

            expect(context.stripeInterfacesService.shouldUpdateAccountInfos(stripeInterface)).toEqual(true)

            verify(context.timeToolServiceMock.now()).never();

        });


    });

    describe('static convertCapabilities', function () {
        it('should convert from stripe format to ConnectAccountCapability', async function () {
            const stripeCapabilities: Stripe.Account.Capabilities = {
                'card_issuing': 'inactive',
                'card_payments': 'active',
                'transfers': 'pending'
            }

            expect(StripeInterfacesService.convertCapabilities(stripeCapabilities)).toEqual([
                {
                    name: 'card_issuing',
                    status: 'inactive'
                },
                {
                    name: 'card_payments',
                    status: 'active'
                },
                {
                    name: 'transfers',
                    status: 'pending'
                }
            ])
        });
    });

    describe('static recoverConnectAccountName', function () {
        it('should recover default name', async function () {

            const stripeAccount: Stripe.Account = {
                business_type: null
            } as Stripe.Account;

            expect(StripeInterfacesService.recoverConnectAccountName(stripeAccount))
                .toEqual('Stripe Connect');

        });

        it('should recover individual without name', async function () {

            const stripeAccount: Stripe.Account = {
                business_type: 'individual',
                individual: {

                }
            } as Stripe.Account;

            expect(StripeInterfacesService.recoverConnectAccountName(stripeAccount))
                .toEqual('Stripe Connect');

        });

        it('should recover individual name', async function () {

            const stripeAccount: Stripe.Account = {
                business_type: 'individual',
                individual: {
                    first_name: 'Jean',
                    last_name: 'Test'
                }
            } as Stripe.Account;

            expect(StripeInterfacesService.recoverConnectAccountName(stripeAccount))
                .toEqual('Jean Test');

        });

        it('should recover company without name', async function () {

            const stripeAccount: Stripe.Account = {
                business_type: 'company',
                company: {

                }
            } as Stripe.Account;

            expect(StripeInterfacesService.recoverConnectAccountName(stripeAccount))
                .toEqual('Stripe Connect');

        });

        it('should recover company name', async function () {

            const stripeAccount: Stripe.Account = {
                business_type: 'company',
                company: {
                    name: 'Company Inc.'
                }
            } as Stripe.Account;

            expect(StripeInterfacesService.recoverConnectAccountName(stripeAccount))
                .toEqual('Company Inc.');

        });

        it('should recover gov name', async function () {

            const stripeAccount: Stripe.Account = {
                business_type: 'government_entity',
                company: {
                    name: 'Government Name'
                }
            } as Stripe.Account;

            expect(StripeInterfacesService.recoverConnectAccountName(stripeAccount))
                .toEqual('Government Name');

        });

        it('should recover non profit name', async function () {

            const stripeAccount: Stripe.Account = {
                business_type: 'non_profit',
                company: {
                    name: 'Non Profit'
                }
            } as Stripe.Account;

            expect(StripeInterfacesService.recoverConnectAccountName(stripeAccount))
                .toEqual('Non Profit');

        });

    });

    describe('static containsExternalAccountFingerprint', function () {
        it('should return false for no accounts', async function () {

            const fingerprint = 'fingerprint';

            const stripeInterface: StripeInterfaceEntity = {
            } as StripeInterfaceEntity;

            expect(StripeInterfacesService.containsExternalAccountFingerprint(stripeInterface, fingerprint))
                .toEqual(false);
        });

        it('should return false for no accounts found', async function () {

            const fingerprint = 'fingerprint';

            const stripeInterface: StripeInterfaceEntity = {
                connect_account_external_accounts: [
                    {
                        fingerprint: 'not_the_fingerprint'
                    },
                    {
                        fingerprint: 'still_not_the_fingerprint'
                    }
                ]
            } as StripeInterfaceEntity;

            expect(StripeInterfacesService.containsExternalAccountFingerprint(stripeInterface, fingerprint))
                .toEqual(false);
        });

        it('should return true for account found', async function () {

            const fingerprint = 'fingerprint';

            const stripeInterface: StripeInterfaceEntity = {
                connect_account_external_accounts: [
                    {
                        fingerprint: 'fingerprint'
                    },
                    {
                        fingerprint: 'still_not_the_fingerprint'
                    }
                ]
            } as StripeInterfaceEntity;

            expect(StripeInterfacesService.containsExternalAccountFingerprint(stripeInterface, fingerprint))
                .toEqual(true);
        });

    });

    describe('updateAccountInfos', function () {

        it('should properly fetch stripe infos and save them (no force)', async function () {

            const now = new Date(Date.now());

            const stripeInterface: StripeInterfaceEntity = {
                id: 'stripe_interface_id',
                connect_account: 'connect_account_id',
                connect_account_updated_at: new Date(now.getTime() - 6 * SECOND)
            } as StripeInterfaceEntity;

            const stripeAccount: Stripe.Account = {
                id: 'connect_account_id',
                capabilities: {
                    transfers: 'active'
                },
                business_type: 'individual',
                individual: {
                    first_name: 'Jean',
                    last_name: 'Argent'
                },
                requirements: {
                    disabled_reason: 'currently_due',
                    current_deadline: now.getTime(),
                    currently_due: [
                        'document'
                    ],
                    eventually_due: [
                        'document'
                    ],
                    past_due: [
                        'document'
                    ],
                    pending_verification: [
                        'document'
                    ],
                    errors: [],
                } as Stripe.Account.Requirements,
                external_accounts: {
                    data: [
                        {
                            id: 'ext_account_id',
                            country: 'FR',
                            last4: '4444',
                            object: 'bank',
                            bank_name: 'The Bank',
                            currency: 'eur',
                            status: 'new',
                            fingerprint: 'fingerprint',
                            default_for_currency: true
                        } as any
                    ]
                }
            } as Stripe.Account;

            const resultInterface: Partial<StripeInterfaceEntity> = {
                connect_account: 'connect_account_id',
                connect_account_capabilities: [{
                    name: 'transfers',
                    status: 'active'
                }],
                connect_account_current_deadline: now,
                connect_account_currently_due: ['document'],
                connect_account_eventually_due: ['document'],
                connect_account_past_due: ['document'],
                connect_account_pending_verification: ['document'],
                connect_account_errors: [],
                connect_account_external_accounts: [{
                    id: 'ext_account_id',
                    country: 'FR',
                    last4: '4444',
                    name: 'The Bank',
                    currency: 'eur',
                    status: 'new',
                    fingerprint: 'fingerprint',
                    default_for_currency: true
                }
                ],
                connect_account_name: 'Jean Argent',
                connect_account_type: 'individual',
                connect_account_disabled_reason: 'currently_due',
                connect_account_updated_at: now,
            }

            const accountResourceMock = mock(Stripe.AccountsResource);
            const spiedService = spy(context.stripeInterfacesService);

            when(context.timeToolServiceMock.now()).thenReturn(now);
            when(context.stripeMock.accounts).thenReturn(instance(accountResourceMock));
            when(accountResourceMock.retrieve('connect_account_id')).thenResolve(stripeAccount);
            when(spiedService.update(deepEqual({
                    id: stripeInterface.id
                }), deepEqual(resultInterface)
            )).thenResolve({
                error: null,
                response: null
            });

            const res = await context.stripeInterfacesService.updateAccountInfos(stripeInterface);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                ...stripeInterface,
                ...resultInterface
            });

            verify(context.timeToolServiceMock.now()).twice();
            verify(context.stripeMock.accounts).once();
            verify(accountResourceMock.retrieve('connect_account_id')).once();
            verify(spiedService.update(deepEqual({
                    id: stripeInterface.id
                }), deepEqual(resultInterface)
            )).once();
        });

        it('should properly fetch stripe infos and save them (force)', async function () {

            const now = new Date(Date.now());

            const stripeInterface: StripeInterfaceEntity = {
                id: 'stripe_interface_id',
                connect_account: 'connect_account_id',
                connect_account_updated_at: now
            } as StripeInterfaceEntity;

            const stripeAccount: Stripe.Account = {
                id: 'connect_account_id',
                capabilities: {
                    transfers: 'active'
                },
                business_type: 'individual',
                individual: {
                    first_name: 'Jean',
                    last_name: 'Argent'
                },
                requirements: {
                    disabled_reason: 'currently_due',
                    current_deadline: now.getTime(),
                    currently_due: [
                        'document'
                    ],
                    eventually_due: [
                        'document'
                    ],
                    past_due: [
                        'document'
                    ],
                    pending_verification: [
                        'document'
                    ],
                    errors: [],
                } as Stripe.Account.Requirements,
                external_accounts: {
                    data: [
                        {
                            id: 'ext_account_id',
                            country: 'FR',
                            last4: '4444',
                            object: 'bank',
                            bank_name: 'The Bank',
                            currency: 'eur',
                            status: 'new',
                            fingerprint: 'fingerprint',
                            default_for_currency: true
                        } as any
                    ]
                }
            } as Stripe.Account;

            const resultInterface: Partial<StripeInterfaceEntity> = {
                connect_account: 'connect_account_id',
                connect_account_capabilities: [{
                    name: 'transfers',
                    status: 'active'
                }],
                connect_account_current_deadline: now,
                connect_account_currently_due: ['document'],
                connect_account_eventually_due: ['document'],
                connect_account_past_due: ['document'],
                connect_account_pending_verification: ['document'],
                connect_account_errors: [],
                connect_account_external_accounts: [{
                    id: 'ext_account_id',
                    country: 'FR',
                    last4: '4444',
                    name: 'The Bank',
                    currency: 'eur',
                    status: 'new',
                    fingerprint: 'fingerprint',
                    default_for_currency: true
                }
                ],
                connect_account_name: 'Jean Argent',
                connect_account_type: 'individual',
                connect_account_disabled_reason: 'currently_due',
                connect_account_updated_at: now,
            }

            const accountResourceMock = mock(Stripe.AccountsResource);
            const spiedService = spy(context.stripeInterfacesService);

            when(context.timeToolServiceMock.now()).thenReturn(now);
            when(context.stripeMock.accounts).thenReturn(instance(accountResourceMock));
            when(accountResourceMock.retrieve('connect_account_id')).thenResolve(stripeAccount);
            when(spiedService.update(deepEqual({
                    id: stripeInterface.id
                }), deepEqual(resultInterface)
            )).thenResolve({
                error: null,
                response: null
            });

            const res = await context.stripeInterfacesService.updateAccountInfos(stripeInterface, true);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                ...stripeInterface,
                ...resultInterface
            });

            verify(context.timeToolServiceMock.now()).once();
            verify(context.stripeMock.accounts).once();
            verify(accountResourceMock.retrieve('connect_account_id')).once();
            verify(spiedService.update(deepEqual({
                    id: stripeInterface.id
                }), deepEqual(resultInterface)
            )).once();
        });

        it('should properly fetch stripe infos and save them (no force + card + no deadline)', async function () {

            const now = new Date(Date.now());

            const stripeInterface: StripeInterfaceEntity = {
                id: 'stripe_interface_id',
                connect_account: 'connect_account_id',
                connect_account_updated_at: new Date(now.getTime() - 6 * SECOND)
            } as StripeInterfaceEntity;

            const stripeAccount: Stripe.Account = {
                id: 'connect_account_id',
                capabilities: {
                    transfers: 'active'
                },
                business_type: 'individual',
                individual: {
                    first_name: 'Jean',
                    last_name: 'Argent'
                },
                requirements: {
                    disabled_reason: 'currently_due',
                    current_deadline: null,
                    currently_due: [
                        'document'
                    ],
                    eventually_due: [
                        'document'
                    ],
                    past_due: [
                        'document'
                    ],
                    pending_verification: [
                        'document'
                    ],
                    errors: [],
                } as Stripe.Account.Requirements,
                external_accounts: {
                    data: [
                        {
                            id: 'ext_account_id',
                            country: 'FR',
                            last4: '4444',
                            object: 'card',
                            brand: 'Visa',
                            currency: 'eur',
                            fingerprint: 'fingerprint',
                            default_for_currency: true
                        } as any
                    ]
                }
            } as Stripe.Account;

            const resultInterface: Partial<StripeInterfaceEntity> = {
                connect_account: 'connect_account_id',
                connect_account_capabilities: [{
                    name: 'transfers',
                    status: 'active'
                }],
                connect_account_current_deadline: null,
                connect_account_currently_due: ['document'],
                connect_account_eventually_due: ['document'],
                connect_account_past_due: ['document'],
                connect_account_pending_verification: ['document'],
                connect_account_errors: [],
                connect_account_external_accounts: [{
                    id: 'ext_account_id',
                    country: 'FR',
                    last4: '4444',
                    name: 'Visa',
                    currency: 'eur',
                    status: 'validated',
                    fingerprint: 'fingerprint',
                    default_for_currency: true
                }
                ],
                connect_account_name: 'Jean Argent',
                connect_account_type: 'individual',
                connect_account_disabled_reason: 'currently_due',
                connect_account_updated_at: now,
            }

            const accountResourceMock = mock(Stripe.AccountsResource);
            const spiedService = spy(context.stripeInterfacesService);

            when(context.timeToolServiceMock.now()).thenReturn(now);
            when(context.stripeMock.accounts).thenReturn(instance(accountResourceMock));
            when(accountResourceMock.retrieve('connect_account_id')).thenResolve(stripeAccount);
            when(spiedService.update(deepEqual({
                    id: stripeInterface.id
                }), deepEqual(resultInterface)
            )).thenResolve({
                error: null,
                response: null
            });

            const res = await context.stripeInterfacesService.updateAccountInfos(stripeInterface);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                ...stripeInterface,
                ...resultInterface
            });

            verify(context.timeToolServiceMock.now()).twice();
            verify(context.stripeMock.accounts).once();
            verify(accountResourceMock.retrieve('connect_account_id')).once();
            verify(spiedService.update(deepEqual({
                    id: stripeInterface.id
                }), deepEqual(resultInterface)
            )).once();
        });

        it('should fail on account fetch error', async function () {

            const now = new Date(Date.now());

            const stripeInterface: StripeInterfaceEntity = {
                id: 'stripe_interface_id',
                connect_account: 'connect_account_id',
                connect_account_updated_at: new Date(now.getTime() - 6 * SECOND)
            } as StripeInterfaceEntity;

            const accountResourceMock = mock(Stripe.AccountsResource);

            when(context.timeToolServiceMock.now()).thenReturn(now);
            when(context.stripeMock.accounts).thenReturn(instance(accountResourceMock));
            when(accountResourceMock.retrieve('connect_account_id')).thenReject(new Error('Cannot retrieve account'));

            const res = await context.stripeInterfacesService.updateAccountInfos(stripeInterface);

            expect(res.error).toEqual('cannot_recover_account');
            expect(res.response).toEqual(null);

            verify(context.timeToolServiceMock.now()).once();
            verify(context.stripeMock.accounts).once();
            verify(accountResourceMock.retrieve('connect_account_id')).once();
        });

        it('should fail on update error', async function () {

            const now = new Date(Date.now());

            const stripeInterface: StripeInterfaceEntity = {
                id: 'stripe_interface_id',
                connect_account: 'connect_account_id',
                connect_account_updated_at: new Date(now.getTime() - 6 * SECOND)
            } as StripeInterfaceEntity;

            const stripeAccount: Stripe.Account = {
                id: 'connect_account_id',
                capabilities: {
                    transfers: 'active'
                },
                business_type: 'individual',
                individual: {
                    first_name: 'Jean',
                    last_name: 'Argent'
                },
                requirements: {
                    disabled_reason: 'currently_due',
                    current_deadline: now.getTime(),
                    currently_due: [
                        'document'
                    ],
                    eventually_due: [
                        'document'
                    ],
                    past_due: [
                        'document'
                    ],
                    pending_verification: [
                        'document'
                    ],
                    errors: [],
                } as Stripe.Account.Requirements,
                external_accounts: {
                    data: [
                        {
                            id: 'ext_account_id',
                            country: 'FR',
                            last4: '4444',
                            object: 'bank',
                            bank_name: 'The Bank',
                            currency: 'eur',
                            status: 'new',
                            fingerprint: 'fingerprint',
                            default_for_currency: true
                        } as any
                    ]
                }
            } as Stripe.Account;

            const resultInterface: Partial<StripeInterfaceEntity> = {
                connect_account: 'connect_account_id',
                connect_account_capabilities: [{
                    name: 'transfers',
                    status: 'active'
                }],
                connect_account_current_deadline: now,
                connect_account_currently_due: ['document'],
                connect_account_eventually_due: ['document'],
                connect_account_past_due: ['document'],
                connect_account_pending_verification: ['document'],
                connect_account_errors: [],
                connect_account_external_accounts: [{
                    id: 'ext_account_id',
                    country: 'FR',
                    last4: '4444',
                    name: 'The Bank',
                    currency: 'eur',
                    status: 'new',
                    fingerprint: 'fingerprint',
                    default_for_currency: true
                }
                ],
                connect_account_name: 'Jean Argent',
                connect_account_type: 'individual',
                connect_account_disabled_reason: 'currently_due',
                connect_account_updated_at: now,
            }

            const accountResourceMock = mock(Stripe.AccountsResource);
            const spiedService = spy(context.stripeInterfacesService);

            when(context.timeToolServiceMock.now()).thenReturn(now);
            when(context.stripeMock.accounts).thenReturn(instance(accountResourceMock));
            when(accountResourceMock.retrieve('connect_account_id')).thenResolve(stripeAccount);
            when(spiedService.update(deepEqual({
                    id: stripeInterface.id
                }), deepEqual(resultInterface)
            )).thenResolve({
                error: 'unexpected_error',
                response: null
            });

            const res = await context.stripeInterfacesService.updateAccountInfos(stripeInterface);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(context.timeToolServiceMock.now()).twice();
            verify(context.stripeMock.accounts).once();
            verify(accountResourceMock.retrieve('connect_account_id')).once();
            verify(spiedService.update(deepEqual({
                    id: stripeInterface.id
                }), deepEqual(resultInterface)
            )).once();
        });

        it('should properly not fetch as not needed', async function () {

            const now = new Date(Date.now());

            const stripeInterface: StripeInterfaceEntity = {
                id: 'stripe_interface_id',
                connect_account: 'connect_account_id',
                connect_account_updated_at: now
            } as StripeInterfaceEntity;

            when(context.timeToolServiceMock.now()).thenReturn(now);

            const res = await context.stripeInterfacesService.updateAccountInfos(stripeInterface);

            verify(context.timeToolServiceMock.now()).once();

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(stripeInterface);

        });

        it('should properly not fetch as no account exists needed', async function () {

            const stripeInterface: StripeInterfaceEntity = {
                id: 'stripe_interface_id',
                connect_account: null
            } as StripeInterfaceEntity;

            const res = await context.stripeInterfacesService.updateAccountInfos(stripeInterface);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(stripeInterface);

        });

    });

    describe('bindAccountToUserInterface', function () {

        it('should properly save connect account for user', async function () {

            const now = new Date(Date.now());

            const stripeInterface: StripeInterfaceEntity = {
                id: 'stripe_interface_id',
                connect_account: 'connect_account_id',
                connect_account_updated_at: new Date(now.getTime() - 6 * SECOND)
            } as StripeInterfaceEntity;

            const stripeAccount: Stripe.Account = {
                id: 'connect_account_id',
                capabilities: {
                    transfers: 'active'
                },
                business_type: 'individual',
                individual: {
                    first_name: 'Jean',
                    last_name: 'Argent'
                },
                requirements: {
                    disabled_reason: 'currently_due',
                    current_deadline: now.getTime(),
                    currently_due: [
                        'document'
                    ],
                    eventually_due: [
                        'document'
                    ],
                    past_due: [
                        'document'
                    ],
                    pending_verification: [
                        'document'
                    ],
                    errors: [],
                } as Stripe.Account.Requirements,
                external_accounts: {
                    data: [
                        {
                            id: 'ext_account_id',
                            country: 'FR',
                            last4: '4444',
                            object: 'bank',
                            bank_name: 'The Bank',
                            currency: 'eur',
                            status: 'new',
                            fingerprint: 'fingerprint',
                            default_for_currency: true
                        } as any
                    ]
                }
            } as Stripe.Account;

            const user: UserDto = {
                id: 'user_id'
            } as UserDto;

            const spiedService = spy(context.stripeInterfacesService);

            when(spiedService.recoverUserInterface(deepEqual(user))).thenResolve({
                error: null,
                response: stripeInterface
            });

            when(spiedService.update(deepEqual({
                id: stripeInterface.id
            }), deepEqual({
                connect_account: stripeAccount.id
            }))).thenResolve({
                error: null,
                response: null
            });

            when(spiedService.updateAccountInfos(deepEqual({
                ...stripeInterface,
                connect_account: stripeAccount.id
            }), true)).thenResolve({
                error: null,
                response: {
                    ...stripeInterface,
                    connect_account: stripeAccount.id
                }
            });

            const res = await context.stripeInterfacesService.bindAccountToUserInterface(user, stripeAccount);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                ...stripeInterface,
                connect_account: stripeAccount.id
            });

            verify(spiedService.recoverUserInterface(deepEqual(user))).times(1);

            verify(spiedService.update(deepEqual({
                id: stripeInterface.id
            }), deepEqual({
                connect_account: stripeAccount.id
            }))).times(1);

            verify(spiedService.updateAccountInfos(deepEqual({
                ...stripeInterface,
                connect_account: stripeAccount.id
            }), true)).times(1);

        });

        it('should fail on interface fetch error', async function () {

            const now = new Date(Date.now());

            const stripeAccount: Stripe.Account = {
                id: 'connect_account_id',
                capabilities: {
                    transfers: 'active'
                },
                business_type: 'individual',
                individual: {
                    first_name: 'Jean',
                    last_name: 'Argent'
                },
                requirements: {
                    disabled_reason: 'currently_due',
                    current_deadline: now.getTime(),
                    currently_due: [
                        'document'
                    ],
                    eventually_due: [
                        'document'
                    ],
                    past_due: [
                        'document'
                    ],
                    pending_verification: [
                        'document'
                    ],
                    errors: [],
                } as Stripe.Account.Requirements,
                external_accounts: {
                    data: [
                        {
                            id: 'ext_account_id',
                            country: 'FR',
                            last4: '4444',
                            object: 'bank',
                            bank_name: 'The Bank',
                            currency: 'eur',
                            status: 'new',
                            fingerprint: 'fingerprint',
                            default_for_currency: true
                        } as any
                    ]
                }
            } as Stripe.Account;

            const user: UserDto = {
                id: 'user_id'
            } as UserDto;

            const spiedService = spy(context.stripeInterfacesService);

            when(spiedService.recoverUserInterface(deepEqual(user))).thenResolve({
                error: 'unexpected_error',
                response: null
            });


            const res = await context.stripeInterfacesService.bindAccountToUserInterface(user, stripeAccount);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(spiedService.recoverUserInterface(deepEqual(user))).times(1);

        });

        it('should fail on update error', async function () {

            const now = new Date(Date.now());

            const stripeInterface: StripeInterfaceEntity = {
                id: 'stripe_interface_id',
                connect_account: 'connect_account_id',
                connect_account_updated_at: new Date(now.getTime() - 6 * SECOND)
            } as StripeInterfaceEntity;

            const stripeAccount: Stripe.Account = {
                id: 'connect_account_id',
                capabilities: {
                    transfers: 'active'
                },
                business_type: 'individual',
                individual: {
                    first_name: 'Jean',
                    last_name: 'Argent'
                },
                requirements: {
                    disabled_reason: 'currently_due',
                    current_deadline: now.getTime(),
                    currently_due: [
                        'document'
                    ],
                    eventually_due: [
                        'document'
                    ],
                    past_due: [
                        'document'
                    ],
                    pending_verification: [
                        'document'
                    ],
                    errors: [],
                } as Stripe.Account.Requirements,
                external_accounts: {
                    data: [
                        {
                            id: 'ext_account_id',
                            country: 'FR',
                            last4: '4444',
                            object: 'bank',
                            bank_name: 'The Bank',
                            currency: 'eur',
                            status: 'new',
                            fingerprint: 'fingerprint',
                            default_for_currency: true
                        } as any
                    ]
                }
            } as Stripe.Account;

            const user: UserDto = {
                id: 'user_id'
            } as UserDto;

            const spiedService = spy(context.stripeInterfacesService);

            when(spiedService.recoverUserInterface(deepEqual(user))).thenResolve({
                error: null,
                response: stripeInterface
            });

            when(spiedService.update(deepEqual({
                id: stripeInterface.id
            }), deepEqual({
                connect_account: stripeAccount.id
            }))).thenResolve({
                error: 'unexpected_error',
                response: null
            });

            const res = await context.stripeInterfacesService.bindAccountToUserInterface(user, stripeAccount);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(spiedService.recoverUserInterface(deepEqual(user))).times(1);

            verify(spiedService.update(deepEqual({
                id: stripeInterface.id
            }), deepEqual({
                connect_account: stripeAccount.id
            }))).times(1);

        });

        it('should fail on account update error', async function () {

            const now = new Date(Date.now());

            const stripeInterface: StripeInterfaceEntity = {
                id: 'stripe_interface_id',
                connect_account: 'connect_account_id',
                connect_account_updated_at: new Date(now.getTime() - 6 * SECOND)
            } as StripeInterfaceEntity;

            const stripeAccount: Stripe.Account = {
                id: 'connect_account_id',
                capabilities: {
                    transfers: 'active'
                },
                business_type: 'individual',
                individual: {
                    first_name: 'Jean',
                    last_name: 'Argent'
                },
                requirements: {
                    disabled_reason: 'currently_due',
                    current_deadline: now.getTime(),
                    currently_due: [
                        'document'
                    ],
                    eventually_due: [
                        'document'
                    ],
                    past_due: [
                        'document'
                    ],
                    pending_verification: [
                        'document'
                    ],
                    errors: [],
                } as Stripe.Account.Requirements,
                external_accounts: {
                    data: [
                        {
                            id: 'ext_account_id',
                            country: 'FR',
                            last4: '4444',
                            object: 'bank',
                            bank_name: 'The Bank',
                            currency: 'eur',
                            status: 'new',
                            fingerprint: 'fingerprint',
                            default_for_currency: true
                        } as any
                    ]
                }
            } as Stripe.Account;

            const user: UserDto = {
                id: 'user_id'
            } as UserDto;

            const spiedService = spy(context.stripeInterfacesService);

            when(spiedService.recoverUserInterface(deepEqual(user))).thenResolve({
                error: null,
                response: stripeInterface
            });

            when(spiedService.update(deepEqual({
                id: stripeInterface.id
            }), deepEqual({
                connect_account: stripeAccount.id
            }))).thenResolve({
                error: null,
                response: null
            });

            when(spiedService.updateAccountInfos(deepEqual({
                ...stripeInterface,
                connect_account: stripeAccount.id
            }), true)).thenResolve({
                error: 'unexpected_error',
                response: null
            });

            const res = await context.stripeInterfacesService.bindAccountToUserInterface(user, stripeAccount);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(spiedService.recoverUserInterface(deepEqual(user))).times(1);

            verify(spiedService.update(deepEqual({
                id: stripeInterface.id
            }), deepEqual({
                connect_account: stripeAccount.id
            }))).times(1);

            verify(spiedService.updateAccountInfos(deepEqual({
                ...stripeInterface,
                connect_account: stripeAccount.id
            }), true)).times(1);

        });

    });

    describe('setDefaultExternalAccountOnUserInterface', function () {
        it('should be a placeholder', async function () {
            console.log('hi');
        });
    });

    describe('removeExternalAccountFromUserInterface', function () {
        it('should be a placeholder', async function () {
            console.log('hi');
        });
    });

    describe('addExternalAccountToUserInterface', function () {
        it('should be a placeholder', async function () {
            console.log('hi');
        });
    });

    describe('generateOnboardingUrl', function () {
        it('should be a placeholder', async function () {
            console.log('hi');
        });
    });

    describe('generateUpdateUrl', function () {
        it('should be a placeholder', async function () {
            console.log('hi');
        });
    });
});
