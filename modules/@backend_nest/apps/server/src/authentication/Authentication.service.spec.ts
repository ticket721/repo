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
    Web3RegisterSigner,
    Web3LoginSigner,
} from '@common/global';
import { hash } from 'bcrypt';
import { UsersService } from '@lib/common/users/Users.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { RocksideService } from '@lib/common/rockside/Rockside.service';

const context: {
    authenticationService: AuthenticationService;
    usersServiceMock: UsersService;
    configServiceMock: ConfigService;
    web3ServiceMock: Web3Service;
    rocksideServiceMock: RocksideService;
} = {
    authenticationService: null,
    usersServiceMock: null,
    configServiceMock: null,
    web3ServiceMock: null,
    rocksideServiceMock: null,
};

const resultAddress = toAcceptedAddressFormat('0x87c02dec6b33498b489e1698801fc2ef79d02eef');

describe('Authentication Service', function() {
    beforeEach(async function() {
        context.usersServiceMock = mock(UsersService);
        context.configServiceMock = mock(ConfigService);
        context.web3ServiceMock = mock(Web3Service);
        context.rocksideServiceMock = mock(RocksideService);

        when(context.configServiceMock.get('AUTH_SIGNATURE_TIMEOUT')).thenReturn('30');
        when(context.web3ServiceMock.net()).thenResolve(1);

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
                    provide: RocksideService,
                    useValue: instance(context.rocksideServiceMock),
                },

                {
                    provide: Web3Service,
                    useValue: instance(context.web3ServiceMock),
                },
            ],
        }).compile();

        context.authenticationService = module.get<AuthenticationService>(AuthenticationService);
    });

    describe('validateWeb3User', function() {
        test('should validate a web3 user', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const loginPayload = web3LoginSigner.generateAuthenticationProofPayload();
            const loginSignature = await web3LoginSigner.sign(wallet.privateKey, loginPayload[1]);

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    address,
                    type: 'web3',
                    password: null,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                    stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
                },
                error: null,
            };

            when(usersServiceMock.findByAddress(address)).thenReturn(Promise.resolve(serviceResponse));

            const res = await authenticationService.validateWeb3User(loginPayload[0].toString(), loginSignature.hex);

            expect(res.response).toBeDefined();
            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                email,
                username,
                address,
                type: 'web3',
                id: '0',
                role: 'authenticated',
                locale: 'en',
                valid: false,
                stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
            });

            verify(usersServiceMock.findByAddress(address)).called();
        });

        test('user does not exist', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const loginPayload = web3LoginSigner.generateAuthenticationProofPayload();
            const loginSignature = await web3LoginSigner.sign(wallet.privateKey, loginPayload[1]);

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByAddress(address)).thenReturn(emptyServiceResponse);

            const res = await authenticationService.validateWeb3User(loginPayload[0].toString(), loginSignature.hex);

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('invalid_signature');

            verify(usersServiceMock.findByAddress(address)).called();
        });

        test('unexpected error', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const loginPayload = web3LoginSigner.generateAuthenticationProofPayload();
            const loginSignature = await web3LoginSigner.sign(wallet.privateKey, loginPayload[1]);

            const errorServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: 'unexpected_error',
            });

            when(usersServiceMock.findByAddress(address)).thenReturn(errorServiceResponse);

            const res = await authenticationService.validateWeb3User(loginPayload[0].toString(), loginSignature.hex);

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('unexpected_error');

            verify(usersServiceMock.findByAddress(address)).called();
        });

        test('signature of the past', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;

            const wallet: Wallet = await createWallet();

            const past = Date.now() - 1000000;
            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const loginPayload = web3LoginSigner.generatePayload(
                {
                    timestamp: past,
                },
                'Web3Login',
            );
            const loginSignature = await web3LoginSigner.sign(wallet.privateKey, loginPayload);

            const res = await authenticationService.validateWeb3User(past.toString(), loginSignature.hex);

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('signature_timed_out');
        });

        test('signature of the future', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;

            const wallet: Wallet = await createWallet();

            const future = Date.now() + 1000000;
            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const loginPayload = web3LoginSigner.generatePayload(
                {
                    timestamp: future,
                },
                'Web3Login',
            );
            const loginSignature = await web3LoginSigner.sign(wallet.privateKey, loginPayload);

            const res = await authenticationService.validateWeb3User(future.toString(), loginSignature.hex);

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('signature_is_in_the_future');
        });
    });

    describe('createWeb3User', function() {
        test('should create a user', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const registerSignature = await web3RegisterSigner.sign(wallet.privateKey, registerPayload[1]);

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    address,
                    type: 'web3',
                    password: null,
                    id: '0',
                    role: 'authenticated',
                    valid: false,
                    locale: 'en',
                    stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(
                usersServiceMock.create(
                    deepEqual({
                        email,
                        username,
                        address,
                        type: 'web3',
                        password: null,
                        role: 'authenticated',
                        locale: 'en',
                        stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
                    }),
                ),
            ).thenReturn(Promise.resolve(serviceResponse));

            when(usersServiceMock.findByAddress(address)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);

            const res = await authenticationService.createWeb3User(
                email,
                username,
                registerPayload[0].toString(),
                address,
                registerSignature.hex,
                'en',
                'cus_HHHHHHHHHHHHHH',
            );

            expect(res.response).toBeDefined();
            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                email,
                username,
                address,
                type: 'web3',
                id: '0',
                role: 'authenticated',
                locale: 'en',
                valid: false,
                stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
            });

            verify(
                usersServiceMock.create(
                    deepEqual({
                        email,
                        username,
                        address,
                        type: 'web3',
                        password: null,
                        role: 'authenticated',
                        locale: 'en',
                        stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
                    }),
                ),
            ).called();

            verify(usersServiceMock.findByAddress(address)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
        });

        test('should report creation error', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const registerSignature = await web3RegisterSigner.sign(wallet.privateKey, registerPayload[1]);

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(
                usersServiceMock.create(
                    deepEqual({
                        email,
                        username,
                        address,
                        type: 'web3',
                        password: null,
                        role: 'authenticated',
                        locale: 'en',
                        stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
                    }),
                ),
            ).thenReturn(
                Promise.resolve({
                    error: 'unexpected_error',
                    response: null,
                }),
            );

            when(usersServiceMock.findByAddress(address)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);

            const res = await authenticationService.createWeb3User(
                email,
                username,
                registerPayload[0].toString(),
                address,
                registerSignature.hex,
                'en',
                'cus_HHHHHHHHHHHHHH',
            );

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                usersServiceMock.create(
                    deepEqual({
                        email,
                        username,
                        address,
                        type: 'web3',
                        password: null,
                        role: 'authenticated',
                        locale: 'en',
                        stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
                    }),
                ),
            ).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByAddress(address)).called();
            verify(usersServiceMock.findByUsername(username)).called();
        });

        test('user by email error', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const registerSignature = await web3RegisterSigner.sign(wallet.privateKey, registerPayload[1]);

            when(usersServiceMock.findByEmail(email)).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'unexpected_error',
                }),
            );

            const res = await authenticationService.createWeb3User(
                email,
                username,
                registerPayload[0].toString(),
                address,
                registerSignature.hex,
                'en',
                'cus_HHHHHHHHHHHHHH',
            );

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('user by username error', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const registerSignature = await web3RegisterSigner.sign(wallet.privateKey, registerPayload[1]);

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

            const res = await authenticationService.createWeb3User(
                email,
                username,
                registerPayload[0].toString(),
                address,
                registerSignature.hex,
                'en',
                'cus_HHHHHHHHHHHHHH',
            );

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
        });

        test('user by address error', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const registerSignature = await web3RegisterSigner.sign(wallet.privateKey, registerPayload[1]);

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);

            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);

            when(usersServiceMock.findByAddress(address)).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'unexpected_error',
                }),
            );

            const res = await authenticationService.createWeb3User(
                email,
                username,
                registerPayload[0].toString(),
                address,
                registerSignature.hex,
                'en',
                'cus_HHHHHHHHHHHHHH',
            );

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByAddress(address)).called();
        });

        test('email already in use', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const registerSignature = await web3RegisterSigner.sign(wallet.privateKey, registerPayload[1]);

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    address,
                    password: null,
                    type: 'web3',
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                    stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
                },
                error: null,
            };

            when(usersServiceMock.findByEmail(email)).thenReturn(Promise.resolve(serviceResponse));

            const res = await authenticationService.createWeb3User(
                email,
                username,
                registerPayload[0].toString(),
                address,
                registerSignature.hex,
                'en',
                'cus_HHHHHHHHHHHHHH',
            );

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
            const address = toAcceptedAddressFormat(wallet.address);

            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const registerSignature = await web3RegisterSigner.sign(wallet.privateKey, registerPayload[1]);

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    address,
                    password: null,
                    type: 'web3',
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                    stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByUsername(username)).thenReturn(Promise.resolve(serviceResponse));
            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);

            const res = await authenticationService.createWeb3User(
                email,
                username,
                registerPayload[0].toString(),
                address,
                registerSignature.hex,
                'en',
                'cus_HHHHHHHHHHHHHH',
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('username_already_in_use');

            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
        });

        test('address already in use', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const registerSignature = await web3RegisterSigner.sign(wallet.privateKey, registerPayload[1]);

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    address,
                    password: null,
                    type: 'web3',
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                    stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByAddress(address)).thenReturn(Promise.resolve(serviceResponse));
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);

            const res = await authenticationService.createWeb3User(
                email,
                username,
                registerPayload[0].toString(),
                address,
                registerSignature.hex,
                'en',
                'cus_HHHHHHHHHHHHHH',
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('address_already_in_use');

            verify(usersServiceMock.findByAddress(address)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
        });

        test('signature in the future', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const other_wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(other_wallet.address);

            const future = Date.now() + 1000000;
            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const registerPayload = web3RegisterSigner.generatePayload(
                {
                    email,
                    username,
                    timestamp: future,
                },
                'Web3Register',
            );
            const registerSignature = await web3RegisterSigner.sign(wallet.privateKey, registerPayload);

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByAddress(address)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);

            const res = await authenticationService.createWeb3User(
                email,
                username,
                future.toString(),
                address,
                registerSignature.hex,
                'en',
                'cus_HHHHHHHHHHHHHH',
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('signature_is_in_the_future');

            verify(usersServiceMock.findByAddress(address)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
        });

        test('invalid signature', async function() {
            const authenticationService: AuthenticationService = context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const other_wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(other_wallet.address);

            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const registerSignature = await web3RegisterSigner.sign(wallet.privateKey, registerPayload[1]);

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByAddress(address)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);

            const res = await authenticationService.createWeb3User(
                email,
                username,
                registerPayload[0].toString(),
                address,
                registerSignature.hex,
                'en',
                'cus_HHHHHHHHHHHHHH',
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('invalid_signature');

            verify(usersServiceMock.findByAddress(address)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
        });
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
                    type: 't721',
                    password: hashedp,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                    stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(
                usersServiceMock.create(
                    deepEqual({
                        email,
                        username,
                        address: anyString(),
                        type: 't721',
                        password: anyString(),
                        role: 'authenticated',
                        locale: 'en',
                        stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
                    }),
                ),
            ).thenReturn(Promise.resolve(serviceResponse));

            when(usersServiceMock.findByAddress(resultAddress)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);
            when(context.rocksideServiceMock.createIdentity()).thenResolve({
                response: {
                    address: resultAddress,
                },
                error: null,
            });

            const res = await authenticationService.createT721User(email, hashedp, username, 'en', 'cus_HHHHHHHHHHHHHH');

            expect(res.response).toBeDefined();
            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                email,
                username,
                address: resultAddress,
                type: 't721',
                id: '0',
                role: 'authenticated',
                valid: false,
                locale: 'en',
                stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
            });

            verify(
                usersServiceMock.create(
                    deepEqual({
                        email,
                        username,
                        address: anyString(),
                        type: 't721',
                        password: anyString(),
                        role: 'authenticated',
                        locale: 'en',
                        stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
                    }),
                ),
            ).called();

            verify(usersServiceMock.findByAddress(resultAddress)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
            verify(context.rocksideServiceMock.createIdentity()).called();
        });

        test('should fail on rockside account creation error', async function() {
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
                    type: 't721',
                    password: hashedp,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                    stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);
            when(context.rocksideServiceMock.createIdentity()).thenResolve({
                response: {
                    address: resultAddress,
                },
                error: 'unexpected_error',
            });

            const res = await authenticationService.createT721User(email, hashedp, username, 'en', 'cus_HHHHHHHHHHHHHH');

                expect(res.response).toBeDefined();
            expect(res.error).toEqual('rockside_identity_creation_error');
            expect(res.response).toEqual(null);

            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
            verify(context.rocksideServiceMock.createIdentity()).called();
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
                    type: 't721',
                    password: hashedp,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                    stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
                },
                error: null,
            };

            when(usersServiceMock.findByEmail(email)).thenReturn(Promise.resolve(serviceResponse));

            const res = await authenticationService.createT721User(email, hashedp, username, 'en', 'cus_HHHHHHHHHHHHHH');

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
                    address: toAcceptedAddressFormat(address),
                    type: 't721',
                    password: hashedp,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                    stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(Promise.resolve(serviceResponse));

            const res = await authenticationService.createT721User(email, hashedp, username, 'en', 'cus_HHHHHHHHHHHHHH');

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('username_already_in_use');
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('address already in use', async function() {
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
                    type: 't721',
                    password: hashedp,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                    stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByAddress(resultAddress)).thenReturn(Promise.resolve(serviceResponse));
            when(context.rocksideServiceMock.createIdentity()).thenResolve({
                response: {
                    address: resultAddress,
                },
                error: null,
            });

            const res = await authenticationService.createT721User(email, hashedp, username, 'en', 'cus_HHHHHHHHHHHHHH');

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('address_already_in_use');
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByAddress(resultAddress)).called();
            verify(context.rocksideServiceMock.createIdentity()).called();
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
            when(context.rocksideServiceMock.createIdentity()).thenResolve({
                response: {
                    address: resultAddress,
                },
                error: null,
            });

            const res = await authenticationService.createT721User(email, hashedp.slice(4), username, 'en', 'cus_HHHHHHHHHHHHHH');

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('password_should_be_keccak256');
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByAddress(resultAddress)).called();
            verify(context.rocksideServiceMock.createIdentity()).called();
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

            const res = await authenticationService.createT721User(email, hashedp.slice(4), username, 'en', 'cus_HHHHHHHHHHHHHH');

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

            const res = await authenticationService.createT721User(email, hashedp.slice(4), username, 'en', 'cus_HHHHHHHHHHHHHH');

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
            when(context.rocksideServiceMock.createIdentity()).thenResolve({
                response: {
                    address: resultAddress,
                },
                error: null,
            });

            const res = await authenticationService.createT721User(email, hashedp.slice(4), username, 'en', 'cus_HHHHHHHHHHHHHH');

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('unexpected_error');
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByAddress(resultAddress)).called();
            verify(context.rocksideServiceMock.createIdentity()).called();
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

            when(
                usersServiceMock.create(
                    deepEqual({
                        email,
                        username,
                        address: anyString(),
                        type: 't721',
                        password: anyString(),
                        role: 'authenticated',
                        locale: 'en',
                        stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
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
            when(context.rocksideServiceMock.createIdentity()).thenResolve({
                response: {
                    address: resultAddress,
                },
                error: null,
            });

            const res = await authenticationService.createT721User(email, hashedp, username, 'en', 'cus_HHHHHHHHHHHHHH');

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('unexpected_error');
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByAddress(resultAddress)).called();
            verify(
                usersServiceMock.create(
                    deepEqual({
                        email,
                        username,
                        address: anyString(),
                        type: 't721',
                        password: anyString(),
                        role: 'authenticated',
                        locale: 'en',
                        stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
                    }),
                ),
            ).called();
            verify(context.rocksideServiceMock.createIdentity()).called();
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
                    address: toAcceptedAddressFormat(address),
                    type: 't721',
                    password: bcrypted,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                    stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
                },
                error: null,
            };

            when(usersServiceMock.findByEmail(email)).thenReturn(Promise.resolve(serviceResponse));

            const res = await authenticationService.validateUser(email, hashedp);

            expect(res.response).toEqual({
                username,
                email,
                address: toAcceptedAddressFormat(address),
                type: 't721',
                id: '0',
                role: 'authenticated',
                locale: 'en',
                valid: false,
                stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
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
                        password: 'this is sensitive',
                        type: 't721',
                        role: 'authenticated',
                        email: 'iulian@t721.com',
                        address: '0x...',
                        valid: true,
                        locale: 'en',
                        stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
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
                role: 'authenticated',
                email: 'iulian@t721.com',
                address: '0x...',
                valid: true,
                locale: 'en',
                stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
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
                username: username,
                role: 'authenticated',
                address: 'blabla',
                valid: true,
                password: 'anypass',
                type: 't721',
                locale: 'fr',
                stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
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
                    address: 'blabla',
                    valid: true,
                    password: 'anypass',
                    type: 't721',
                    locale: 'fr',
                    stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
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
                    locale: 'fr',
                    address: 'blabla',
                    type: 't721',
                    role: 'authenticated',
                    valid: true,
                    stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
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
                    username: 'salut',
                    locale: 'fr',
                    address: 'blabla',
                    type: 't721',
                    role: 'authenticated',
                    valid: true,
                    stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
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
                    type: 't721',
                    password: hashedp,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                    stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
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
                    locale: 'fr',
                    address: 'blabla',
                    type: 't721',
                    role: 'authenticated',
                    valid: true,
                    stripe_customer_token: 'cus_HHHHHHHHHHHHHH'
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
