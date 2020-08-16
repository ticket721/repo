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

class StripeInterfaceEntityMock {
    public _properties = null;

    search(options: EsSearchOptionsStatic, callback?: (err: any, ret: any) => void): void {
        return;
    }
}

describe('StripeInterfaces Service', function() {
    const context: {
        stripeInterfacesService: StripeInterfacesService;
        stripeInterfaceEntityMock: StripeInterfaceEntityMock;
        stripeInterfacesRepositoryMock: StripeInterfacesRepository;
        stripeServiceMock: StripeService;
        stripeMock: Stripe;
    } = {
        stripeInterfacesService: null,
        stripeInterfaceEntityMock: null,
        stripeInterfacesRepositoryMock: null,
        stripeServiceMock: null,
        stripeMock: null,
    };

    beforeEach(async function() {
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
                StripeInterfacesService,
            ],
        }).compile();

        context.stripeInterfacesService = app.get<StripeInterfacesService>(StripeInterfacesService);
    });

    describe('createStripeInterface', function() {
        it('should properly create a stripe interface', async function() {
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

        it('should fail on interface recovery error', async function() {
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

        it('should fail on already existing interface', async function() {
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

        it('should fail on creation error', async function() {
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

    describe('recoverUserInterface', function() {
        it('should properly recover a user stripe interface', async function() {
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

        it('should fail on query error', async function() {
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

        it('should return null when not found', async function() {
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

    describe('recoverBalance', function() {
        it('should properly recover account balance', async function() {
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

        it('should fail on fetch error', async function() {
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

    describe('createAccount', function() {
        it('should properly create a connect account', async function() {
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

        it('should fail on token fetch error', async function() {
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

        it('should fail on already used token', async function() {
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

        it('should fail on account creation error', async function() {
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

    describe('static shouldUpdateAccountInfos', function() {
        it('should be a placeholder', async function() {
            console.log('hi');
        });
    });

    describe('static convertCapabilities', function() {
        it('should be a placeholder', async function() {
            console.log('hi');
        });
    });

    describe('static recoverConnectAccountName', function() {
        it('should be a placeholder', async function() {
            console.log('hi');
        });
    });

    describe('updateAccountInfos', function() {
        it('should be a placeholder', async function() {
            console.log('hi');
        });
    });

    describe('bindAccountToUserInterface', function() {
        it('should be a placeholder', async function() {
            console.log('hi');
        });
    });
    describe('static containsExternalAccountFingerprint', function() {
        it('should be a placeholder', async function() {
            console.log('hi');
        });
    });

    describe('setDefaultExternalAccountOnUserInterface', function() {
        it('should be a placeholder', async function() {
            console.log('hi');
        });
    });

    describe('removeExternalAccountFromUserInterface', function() {
        it('should be a placeholder', async function() {
            console.log('hi');
        });
    });

    describe('addExternalAccountToUserInterface', function() {
        it('should be a placeholder', async function() {
            console.log('hi');
        });
    });

    describe('generateOnboardingUrl', function() {
        it('should be a placeholder', async function() {
            console.log('hi');
        });
    });

    describe('generateUpdateUrl', function() {
        it('should be a placeholder', async function() {
            console.log('hi');
        });
    });
});
