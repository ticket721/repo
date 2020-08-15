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
        it('should be a placeholder', async function() {
            console.log('hi');
        });
    });

    describe('recoverBalance', function() {
        it('should be a placeholder', async function() {
            console.log('hi');
        });
    });

    describe('createAccount', function() {
        it('should be a placeholder', async function() {
            console.log('hi');
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
