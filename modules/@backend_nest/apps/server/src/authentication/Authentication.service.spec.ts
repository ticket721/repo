import { Test, TestingModule } from '@nestjs/testing';
import { anyString, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { AuthenticationService } from './Authentication.service';
import {
    createWallet,
    encryptWallet,
    keccak256,
    toAcceptedAddressFormat,
    toAcceptedKeccak256Format,
    Wallet,
} from '@common/global';
import { hash } from 'bcrypt';
import { UsersService } from '@lib/common/users/Users.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { UUIDToolService } from '@lib/common/toolbox/UUID.tool.service';
import { PurchasesService } from '@lib/common/purchases/Purchases.service';
import { PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';

const context: {
    authenticationService: AuthenticationService;
    usersServiceMock: UsersService;
    configServiceMock: ConfigService;
    uuidToolServiceMock: UUIDToolService;
    purchasesServiceMock: PurchasesService;
} = {
    authenticationService: null,
    usersServiceMock: null,
    configServiceMock: null,
    uuidToolServiceMock: null,
    purchasesServiceMock: null,
};

const resultAddress = toAcceptedAddressFormat('0x0000000000000000000000000000000000000000');
const uuid = 'ef06f5d9-e867-4319-8ca5-c1953c7b3138';

describe('Authentication Service', function() {
    beforeEach(async function() {
        context.usersServiceMock = mock(UsersService);
        context.configServiceMock = mock(ConfigService);
        context.uuidToolServiceMock = mock(UUIDToolService);
        context.purchasesServiceMock = mock(PurchasesService);

        when(context.uuidToolServiceMock.generate()).thenReturn(uuid);
        when(context.configServiceMock.get('AUTH_SIGNATURE_TIMEOUT')).thenReturn('30');

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthenticationService,
                {
                    provide: UsersService,
                    useValue: instance(context.usersServiceMock),
                },

                {
                    provide: ConfigService,
                    useValue: instance(context.configServiceMock),
                },

                {
                    provide: UUIDToolService,
                    useValue: instance(context.uuidToolServiceMock),
                },

                {
                    provide: PurchasesService,
                    useValue: instance(context.purchasesServiceMock),
                },
            ],
        }).compile();

        context.authenticationService = module.get<AuthenticationService>(AuthenticationService);
    });

    describe('createT721User', function() {
        test('should create a user', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    address: resultAddress,
                    device_address: null,
                    type: 't721',
                    password: hashedp,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                    admin: false,
                    avatar: null,
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            const purchaseEntity: Partial<PurchaseEntity> = {
                id: uuid,
                owner: uuid,
                fees: [],
                products: [],
                currency: null,
                payment: null,
                payment_interface: null,
                checked_out_at: null,
                price: null,
            };

            when(
                context.purchasesServiceMock.create(
                    deepEqual({
                        owner: uuid,
                        fees: [],
                        products: [],
                        currency: null,
                        payment: null,
                        payment_interface: null,
                        checked_out_at: null,
                        price: null,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: purchaseEntity as PurchaseEntity,
            });

            when(
                usersServiceMock.create(
                    deepEqual({
                        id: UUIDToolService.fromString(uuid),
                        current_purchase: UUIDToolService.fromString(uuid),
                        email,
                        device_address: null,
                        username,
                        address: anyString(),
                        type: 't721',
                        password: anyString(),
                        role: 'authenticated',
                        locale: 'en',
                        admin: false,
                        avatar: null,
                    }),
                ),
            ).thenReturn(Promise.resolve(serviceResponse));

            when(usersServiceMock.findByAddress(resultAddress)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);

            const res = await authenticationService.createT721User(email, hashedp, username, 'en');

            expect(res.response).toBeDefined();
            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                email,
                username,
                address: resultAddress,
                device_address: null,
                type: 't721',
                id: '0',
                role: 'authenticated',
                valid: false,
                locale: 'en',
                admin: false,
                avatar: null,
            });

            verify(
                context.purchasesServiceMock.create(
                    deepEqual({
                        owner: uuid,
                        fees: [],
                        products: [],
                        currency: null,
                        payment: null,
                        payment_interface: null,
                        checked_out_at: null,
                        price: null,
                    }),
                ),
            ).once();

            verify(
                usersServiceMock.create(
                    deepEqual({
                        id: UUIDToolService.fromString(uuid),
                        current_purchase: UUIDToolService.fromString(uuid),
                        email,
                        username,
                        device_address: null,
                        address: anyString(),
                        type: 't721',
                        password: anyString(),
                        role: 'authenticated',
                        locale: 'en',
                        admin: false,
                        avatar: null,
                    }),
                ),
            ).called();

            verify(usersServiceMock.findByAddress(resultAddress)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
        });

        test('email already in use', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted = await encryptWallet(wallet, hashedp);

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    address: toAcceptedAddressFormat(address),
                    device_address: null,
                    type: 't721',
                    password: hashedp,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                    admin: false,
                    avatar: null,
                },
                error: null,
            };

            when(usersServiceMock.findByEmail(email)).thenReturn(Promise.resolve(serviceResponse));

            const res = await authenticationService.createT721User(email, hashedp, username, 'en');

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('email_already_in_use');
            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('username already in use', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));

            const encrypted = await encryptWallet(wallet, hashedp);

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    device_address: null,
                    address: toAcceptedAddressFormat(address),
                    type: 't721',
                    password: hashedp,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                    admin: false,
                    avatar: null,
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(Promise.resolve(serviceResponse));

            const res = await authenticationService.createT721User(email, hashedp, username, 'en');

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('username_already_in_use');
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('invalid password', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByAddress(resultAddress)).thenReturn(emptyServiceResponse);

            const res = await authenticationService.createT721User(email, hashedp.slice(4), username, 'en');

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('password_should_be_keccak256');
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByAddress(resultAddress)).called();
        });

        test('email query internal error', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));

            when(usersServiceMock.findByEmail(email)).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'unexpected_error',
                }),
            );

            const res = await authenticationService.createT721User(email, hashedp.slice(4), username, 'en');

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('unexpected_error');
            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('username query internal error', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'unexpected_error',
                }),
            );

            const res = await authenticationService.createT721User(email, hashedp.slice(4), username, 'en');

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('unexpected_error');
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
        });

        test('address query internal error', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByAddress(resultAddress)).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'unexpected_error',
                }),
            );

            const res = await authenticationService.createT721User(email, hashedp.slice(4), username, 'en');

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('unexpected_error');
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByAddress(resultAddress)).called();
        });

        test('create user internal error', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            const purchaseEntity: Partial<PurchaseEntity> = {
                id: uuid,
                owner: uuid,
                fees: [],
                products: [],
                currency: null,
                payment: null,
                payment_interface: null,
                checked_out_at: null,
                price: null,
            };

            when(
                context.purchasesServiceMock.create(
                    deepEqual({
                        owner: uuid,
                        fees: [],
                        products: [],
                        currency: null,
                        payment: null,
                        payment_interface: null,
                        checked_out_at: null,
                        price: null,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: purchaseEntity as PurchaseEntity,
            });

            when(
                usersServiceMock.create(
                    deepEqual({
                        id: UUIDToolService.fromString(uuid),
                        current_purchase: UUIDToolService.fromString(uuid),
                        email,
                        device_address: null,
                        username,
                        address: anyString(),
                        type: 't721',
                        password: anyString(),
                        role: 'authenticated',
                        locale: 'en',
                        admin: false,
                        avatar: null,
                    }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'unexpected_error',
                }),
            );

            when(usersServiceMock.findByAddress(resultAddress)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);

            const res = await authenticationService.createT721User(email, hashedp, username, 'en');

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('unexpected_error');
            verify(
                context.purchasesServiceMock.create(
                    deepEqual({
                        owner: uuid,
                        fees: [],
                        products: [],
                        currency: null,
                        payment: null,
                        payment_interface: null,
                        checked_out_at: null,
                        price: null,
                    }),
                ),
            ).once();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByAddress(resultAddress)).called();
            verify(
                usersServiceMock.create(
                    deepEqual({
                        id: UUIDToolService.fromString(uuid),
                        current_purchase: UUIDToolService.fromString(uuid),
                        email,
                        username,
                        device_address: null,
                        address: anyString(),
                        type: 't721',
                        password: anyString(),
                        role: 'authenticated',
                        locale: 'en',
                        admin: false,
                        avatar: null,
                    }),
                ),
            ).called();
        });

        test('should fail on purchase entity creation error', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            const purchaseEntity: Partial<PurchaseEntity> = {
                id: uuid,
                owner: uuid,
                fees: [],
                products: [],
                currency: null,
                payment: null,
                payment_interface: null,
                checked_out_at: null,
                price: null,
            };

            when(
                context.purchasesServiceMock.create(
                    deepEqual({
                        owner: uuid,
                        fees: [],
                        products: [],
                        currency: null,
                        payment: null,
                        payment_interface: null,
                        checked_out_at: null,
                        price: null,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: purchaseEntity as PurchaseEntity,
            });

            when(usersServiceMock.findByAddress(resultAddress)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);

            const res = await authenticationService.createT721User(email, hashedp, username, 'en');

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('unexpected_error');

            verify(
                context.purchasesServiceMock.create(
                    deepEqual({
                        owner: uuid,
                        fees: [],
                        products: [],
                        currency: null,
                        payment: null,
                        payment_interface: null,
                        checked_out_at: null,
                        price: null,
                    }),
                ),
            ).once();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByAddress(resultAddress)).called();
        });
    });

    describe('validateUser', function() {
        test('checks valid user', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const bcrypted = await hash(hashedp, 4);
            const encrypted_string = await encryptWallet(wallet, hashedp);

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    device_address: null,
                    address: toAcceptedAddressFormat(address),
                    type: 't721',
                    password: bcrypted,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                    admin: false,
                    avatar: null,
                },
                error: null,
            };

            when(usersServiceMock.findByEmail(email)).thenReturn(Promise.resolve(serviceResponse));

            const res = await authenticationService.validateUser(email, hashedp);

            expect(res.response).toEqual({
                username,
                email,
                address: toAcceptedAddressFormat(address),
                device_address: null,
                type: 't721',
                id: '0',
                role: 'authenticated',
                locale: 'en',
                valid: false,
                admin: false,
                avatar: null,
            });
            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('check errors', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));

            const serviceResponse: ServiceResponse<UserDto> = {
                response: null,
                error: 'unexpected_error',
            };

            when(usersServiceMock.findByEmail(email)).thenReturn(Promise.resolve(serviceResponse));

            const res = await authenticationService.validateUser(email, hashedp);

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('unexpected_error');
            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('invalid credentials', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));

            const serviceResponse: ServiceResponse<UserDto> = {
                response: null,
                error: null,
            };

            when(usersServiceMock.findByEmail(email)).thenReturn(Promise.resolve(serviceResponse));

            const res = await authenticationService.validateUser(email, hashedp);

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('invalid_credentials');
            verify(usersServiceMock.findByEmail(email)).called();
        });
    });

    describe('validateUserEmail', function() {
        it('should validate user email', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;

            const usersServiceMock: UsersService = context.usersServiceMock;

            const id = '123';

            when(
                usersServiceMock.update(
                    deepEqual({
                        id,
                        valid: true,
                    }),
                ),
            ).thenReturn(
                Promise.resolve({
                    error: null,
                    response: {
                        id,
                        username: 'hey',
                        device_address: null,
                        password: 'this is sensitive',
                        type: 't721',
                        role: 'authenticated',
                        email: 'iulian@t721.com',
                        address: '0x...',
                        valid: true,
                        locale: 'en',
                        admin: false,
                        avatar: null,
                    },
                }),
            );

            const res = await authenticationService.validateUserEmail(id);

            expect(res.error).toEqual(null);
            expect((res.response as any).password).toBeUndefined();
            expect(res.response).toEqual({
                id,
                username: 'hey',
                type: 't721',
                device_address: null,
                role: 'authenticated',
                email: 'iulian@t721.com',
                address: '0x...',
                valid: true,
                locale: 'en',
                admin: false,
                avatar: null,
            });
        });

        it('should report update error', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;

            const usersServiceMock: UsersService = context.usersServiceMock;

            const id = '123';

            when(
                usersServiceMock.update(
                    deepEqual({
                        id,
                        valid: true,
                    }),
                ),
            ).thenReturn(
                Promise.resolve({
                    error: 'unexpected_error',
                    response: null,
                }),
            );

            const res = await authenticationService.validateUserEmail(id);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);
        });
    });

    describe('getUserIfEmailExists', function() {
        test('User not found with error', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'notexisting@test.com';

            when(usersServiceMock.findByEmail(email)).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'user_not_found',
                }),
            );

            const res = await authenticationService.getUserIfEmailExists(email);

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('user_not_found');

            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('User not found without error', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'notexisting@test.com';

            when(usersServiceMock.findByEmail(email)).thenReturn(
                Promise.resolve({
                    response: null,
                    error: null,
                }),
            );

            const res = await authenticationService.getUserIfEmailExists(email);

            expect(res.response).toEqual(null);
            expect(res.error).toEqual(null);

            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('User found', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'notexisting@test.com';
            const username = 'anonymous';

            const user: UserDto = {
                id: '123',
                email: email,
                device_address: null,
                username: username,
                role: 'authenticated',
                address: 'blabla',
                valid: true,
                password: 'anypass',
                type: 't721',
                locale: 'fr',
                admin: false,
                avatar: null,
            };

            when(usersServiceMock.findByEmail(email)).thenReturn(
                Promise.resolve({
                    response: user,
                    error: null,
                }),
            );

            const res = await authenticationService.getUserIfEmailExists(email);

            expect(res.response).toEqual(user);
            expect(res.error).toEqual(null);

            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('Internal error', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'notexisting@test.com';

            when(usersServiceMock.findByEmail(email)).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'unexpected_error',
                }),
            );

            const res = await authenticationService.getUserIfEmailExists(email);

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('unexpected_error');

            verify(usersServiceMock.findByEmail(email)).called();
        });
    });

    describe('validateResetPassword', function() {
        test('Bad password formating', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;

            const id = '0';
            const password = 'NotHashedPassword';

            const res = await authenticationService.validateResetPassword(id, password);

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('password_should_be_keccak256');
        });

        test('Password reset internal error', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const id = '0';
            const password = toAcceptedKeccak256Format(keccak256('password'));

            when(
                usersServiceMock.update(
                    deepEqual({
                        id: '0',
                        password: anyString(),
                    }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'unexpected_error',
                }),
            );

            const res = await authenticationService.validateResetPassword(id, password);

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('unexpected_error');
            verify(
                usersServiceMock.update(
                    deepEqual({
                        id: '0',
                        password: anyString(),
                    }),
                ),
            ).called();
        });

        test('Password reset successful', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const id = '0';
            const password = toAcceptedKeccak256Format(keccak256('password'));

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    id: '0',
                    email: 'salut@test.com',
                    username: 'salut',
                    role: 'authenticated',
                    device_address: null,
                    address: 'blabla',
                    valid: true,
                    password: 'anypass',
                    type: 't721',
                    locale: 'fr',
                    admin: false,
                    avatar: null,
                },
                error: null,
            };

            when(
                usersServiceMock.update(
                    deepEqual({
                        id: '0',
                        password: anyString(),
                    }),
                ),
            ).thenReturn(Promise.resolve(serviceResponse));

            const res = await authenticationService.validateResetPassword(id, password);

            delete serviceResponse.response.password;
            expect(res.response).toEqual(serviceResponse.response);
            expect(res.error).toEqual(null);
            verify(
                usersServiceMock.update(
                    deepEqual({
                        id: '0',
                        password: anyString(),
                    }),
                ),
            ).called();
        });
    });

    describe('updateUserPassword', function() {
        test('email query internal error', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'notexisting@test.com';
            const hashedp = toAcceptedKeccak256Format(keccak256('password'));

            when(usersServiceMock.findByEmail(email)).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'user_not_found',
                }),
            );

            const res = await authenticationService.updateUserPassword(email, hashedp);

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('user_not_found');

            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('invalid password', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'user@test.com';
            const password = 'NotHashedPass';

            when(usersServiceMock.findByEmail(email)).thenResolve({
                error: null,
                response: {
                    id: '123',
                    email: email,
                    password: toAcceptedKeccak256Format(keccak256('password')),
                    username: 'salut',
                    device_address: null,
                    locale: 'fr',
                    address: 'blabla',
                    type: 't721',
                    role: 'authenticated',
                    valid: true,
                    admin: false,
                    avatar: null,
                },
            });

            const res = await authenticationService.updateUserPassword(email, password);

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('password_should_be_keccak256');

            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('error password change', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'user@test.com';
            const hashedp = toAcceptedKeccak256Format(keccak256('password'));

            when(
                usersServiceMock.update(
                    deepEqual({
                        id: '123',
                        password: anyString(),
                    }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'unexpected_error',
                }),
            );

            when(usersServiceMock.findByEmail(email)).thenResolve({
                error: null,
                response: {
                    id: '123',
                    email: email,
                    password: toAcceptedKeccak256Format(keccak256('password')),
                    device_address: null,
                    username: 'salut',
                    locale: 'fr',
                    address: 'blabla',
                    type: 't721',
                    role: 'authenticated',
                    valid: true,
                    admin: false,
                    avatar: null,
                },
            });

            const res = await authenticationService.updateUserPassword(email, hashedp);

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('unexpected_error');
            verify(usersServiceMock.findByEmail(email)).called();
            verify(
                usersServiceMock.update(
                    deepEqual({
                        id: '123',
                        password: anyString(),
                    }),
                ),
            ).called();
        });

        test('successful password change', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'user@test.com';
            const hashedp = toAcceptedKeccak256Format(keccak256('password'));

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username: 'salut',
                    address: resultAddress,
                    device_address: null,
                    type: 't721',
                    password: hashedp,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                    admin: false,
                    avatar: null,
                },
                error: null,
            };

            when(
                usersServiceMock.update(
                    deepEqual({
                        id: '123',
                        password: anyString(),
                    }),
                ),
            ).thenReturn(Promise.resolve(serviceResponse));

            when(usersServiceMock.findByEmail(email)).thenResolve({
                error: null,
                response: {
                    id: '123',
                    email: email,
                    password: toAcceptedKeccak256Format(keccak256('password')),
                    username: 'salut',
                    device_address: null,
                    locale: 'fr',
                    address: 'blabla',
                    type: 't721',
                    role: 'authenticated',
                    valid: true,
                    admin: false,
                    avatar: null,
                },
            });

            const res = await authenticationService.updateUserPassword(email, hashedp);

            delete serviceResponse.response.password;
            expect(res.response).toEqual(serviceResponse.response);
            expect(res.error).toEqual(null);
            verify(usersServiceMock.findByEmail(email)).called();
            verify(
                usersServiceMock.update(
                    deepEqual({
                        id: '123',
                        password: anyString(),
                    }),
                ),
            ).called();
        });
    });
});
