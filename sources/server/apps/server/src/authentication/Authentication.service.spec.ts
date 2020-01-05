import { Test, TestingModule } from '@nestjs/testing';
import { anyString, deepEqual, instance, mock, verify, when } from 'ts-mockito';
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
} from '@ticket721sources/global';
import { hash } from 'bcrypt';
import { ServiceResponse } from '../utils/ServiceResponse';
import { UsersService } from '@lib/common/users/Users.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { Web3TokensService } from '@app/server/web3token/Web3Tokens.service';
import { RefractFactoryV0Service } from '@lib/common/contracts/refract/RefractFactory.V0.service';

const context: {
    authenticationService: AuthenticationService;
    usersServiceMock: UsersService;
    configServiceMock: ConfigService;
    refractFactoryV0Service: RefractFactoryV0Service;
} = {
    authenticationService: null,
    usersServiceMock: null,
    configServiceMock: null,
    refractFactoryV0Service: null,
};

const resultAddress = toAcceptedAddressFormat(
    '0x87c02dec6b33498b489e1698801fc2ef79d02eef',
);

describe('Authentication Service', function() {
    beforeEach(async function() {
        const usersServiceMock: UsersService = mock(UsersService);
        const configServiceMock: ConfigService = mock(ConfigService);
        const refractFactoryServiceMock: RefractFactoryV0Service = mock(
            RefractFactoryV0Service,
        );

        const UsersServiceProvider = {
            provide: UsersService,
            useValue: instance(usersServiceMock),
        };

        const ConfigServiceProvider = {
            provide: ConfigService,
            useValue: instance(configServiceMock),
        };

        const RefractFactoryV0ServiceProvider = {
            provide: RefractFactoryV0Service,
            useValue: instance(refractFactoryServiceMock),
        };

        when(configServiceMock.get('AUTH_SIGNATURE_TIMEOUT')).thenReturn('30');

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersServiceProvider,
                ConfigServiceProvider,
                AuthenticationService,
                RefractFactoryV0ServiceProvider,
            ],
        }).compile();

        const contract_instance = {
            methods: {
                predict: (...args: any[]) => ({
                    call: async () => resultAddress,
                }),
            },
        };
        when(refractFactoryServiceMock.get()).thenReturn(
            Promise.resolve(contract_instance),
        );

        context.authenticationService = module.get<AuthenticationService>(
            AuthenticationService,
        );
        context.usersServiceMock = usersServiceMock;
        context.configServiceMock = configServiceMock;
        context.refractFactoryV0Service = refractFactoryServiceMock;
    });

    describe('validateWeb3User', function() {
        test('should validate a web3 user', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const loginPayload = web3LoginSigner.generateAuthenticationProofPayload();
            const loginSignature = await web3LoginSigner.sign(
                wallet.privateKey,
                loginPayload[1],
            );

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    wallet: null,
                    address,
                    type: 'web3',
                    password: null,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                },
                error: null,
            };

            when(usersServiceMock.findByAddress(address)).thenReturn(
                Promise.resolve(serviceResponse),
            );

            const res = await authenticationService.validateWeb3User(
                loginPayload[0].toString(),
                loginSignature.hex,
            );

            expect(res.response).toBeDefined();
            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                email,
                username,
                wallet: null,
                address,
                type: 'web3',
                id: '0',
                role: 'authenticated',
                locale: 'en',
                valid: false,
            });

            verify(usersServiceMock.findByAddress(address)).called();
        });

        test('user does not exist', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const loginPayload = web3LoginSigner.generateAuthenticationProofPayload();
            const loginSignature = await web3LoginSigner.sign(
                wallet.privateKey,
                loginPayload[1],
            );

            const emptyServiceResponse: Promise<ServiceResponse<
                UserDto
            >> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByAddress(address)).thenReturn(
                emptyServiceResponse,
            );

            const res = await authenticationService.validateWeb3User(
                loginPayload[0].toString(),
                loginSignature.hex,
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('invalid_signature');

            verify(usersServiceMock.findByAddress(address)).called();
        });

        test('unexpected error', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const loginPayload = web3LoginSigner.generateAuthenticationProofPayload();
            const loginSignature = await web3LoginSigner.sign(
                wallet.privateKey,
                loginPayload[1],
            );

            const errorServiceResponse: Promise<ServiceResponse<
                UserDto
            >> = Promise.resolve({
                response: null,
                error: 'unexpected_error',
            });

            when(usersServiceMock.findByAddress(address)).thenReturn(
                errorServiceResponse,
            );

            const res = await authenticationService.validateWeb3User(
                loginPayload[0].toString(),
                loginSignature.hex,
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('unexpected_error');

            verify(usersServiceMock.findByAddress(address)).called();
        });

        test('signature of the past', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;

            const wallet: Wallet = await createWallet();

            const past = Date.now() - 1000000;
            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const loginPayload = web3LoginSigner.generatePayload(
                {
                    timestamp: past,
                },
                'Web3Login',
            );
            const loginSignature = await web3LoginSigner.sign(
                wallet.privateKey,
                loginPayload,
            );

            const res = await authenticationService.validateWeb3User(
                past.toString(),
                loginSignature.hex,
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('signature_timed_out');
        });

        test('signature of the future', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;

            const wallet: Wallet = await createWallet();

            const future = Date.now() + 1000000;
            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const loginPayload = web3LoginSigner.generatePayload(
                {
                    timestamp: future,
                },
                'Web3Login',
            );
            const loginSignature = await web3LoginSigner.sign(
                wallet.privateKey,
                loginPayload,
            );

            const res = await authenticationService.validateWeb3User(
                future.toString(),
                loginSignature.hex,
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('signature_is_in_the_future');
        });
    });

    describe('createWeb3User', function() {
        test('should create a user', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(
                1,
            );
            const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(
                email,
                username,
            );
            const registerSignature = await web3RegisterSigner.sign(
                wallet.privateKey,
                registerPayload[1],
            );

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    wallet: null,
                    address,
                    type: 'web3',
                    password: null,
                    id: '0',
                    role: 'authenticated',
                    valid: false,
                    locale: 'en',
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<
                UserDto
            >> = Promise.resolve({
                response: null,
                error: null,
            });

            when(
                usersServiceMock.create(
                    deepEqual({
                        email,
                        username,
                        wallet: null,
                        address,
                        type: 'web3',
                        password: null,
                        role: 'authenticated',
                        locale: 'en',
                    }),
                ),
            ).thenReturn(Promise.resolve(serviceResponse));

            when(usersServiceMock.findByAddress(address)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByEmail(email)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByUsername(username)).thenReturn(
                emptyServiceResponse,
            );

            const res = await authenticationService.createWeb3User(
                email,
                username,
                registerPayload[0].toString(),
                address,
                registerSignature.hex,
                'en',
            );

            expect(res.response).toBeDefined();
            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                email,
                username,
                wallet: null,
                address,
                type: 'web3',
                id: '0',
                role: 'authenticated',
                locale: 'en',
                valid: false,
            });

            verify(
                usersServiceMock.create(
                    deepEqual({
                        email,
                        username,
                        wallet: null,
                        address,
                        type: 'web3',
                        password: null,
                        role: 'authenticated',
                        locale: 'en',
                    }),
                ),
            ).called();

            verify(usersServiceMock.findByAddress(address)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
        });

        test('user by email error', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(
                1,
            );
            const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(
                email,
                username,
            );
            const registerSignature = await web3RegisterSigner.sign(
                wallet.privateKey,
                registerPayload[1],
            );

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    wallet: null,
                    address,
                    type: 'web3',
                    password: null,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<
                UserDto
            >> = Promise.resolve({
                response: null,
                error: null,
            });

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
            );

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('user by username error', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(
                1,
            );
            const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(
                email,
                username,
            );
            const registerSignature = await web3RegisterSigner.sign(
                wallet.privateKey,
                registerPayload[1],
            );

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    wallet: null,
                    address,
                    type: 'web3',
                    password: null,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<
                UserDto
            >> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(
                emptyServiceResponse,
            );

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
            );

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
        });

        test('user by address error', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(
                1,
            );
            const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(
                email,
                username,
            );
            const registerSignature = await web3RegisterSigner.sign(
                wallet.privateKey,
                registerPayload[1],
            );

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    wallet: null,
                    address,
                    type: 'web3',
                    password: null,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<
                UserDto
            >> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(
                emptyServiceResponse,
            );

            when(usersServiceMock.findByUsername(username)).thenReturn(
                emptyServiceResponse,
            );

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
            );

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByAddress(address)).called();
        });

        test('email already in use', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;
            const web3TokensServiceMock: Web3TokensService = this
                .web3TokensServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(
                1,
            );
            const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(
                email,
                username,
            );
            const registerSignature = await web3RegisterSigner.sign(
                wallet.privateKey,
                registerPayload[1],
            );

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    wallet: null,
                    address,
                    password: null,
                    type: 'web3',
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                },
                error: null,
            };

            when(usersServiceMock.findByEmail(email)).thenReturn(
                Promise.resolve(serviceResponse),
            );

            const res = await authenticationService.createWeb3User(
                email,
                username,
                registerPayload[0].toString(),
                address,
                registerSignature.hex,
                'en',
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('email_already_in_use');

            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('username already in use', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;
            const web3TokensServiceMock: Web3TokensService = this
                .web3TokensServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(
                1,
            );
            const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(
                email,
                username,
            );
            const registerSignature = await web3RegisterSigner.sign(
                wallet.privateKey,
                registerPayload[1],
            );

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    wallet: null,
                    address,
                    password: null,
                    type: 'web3',
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<
                UserDto
            >> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByUsername(username)).thenReturn(
                Promise.resolve(serviceResponse),
            );
            when(usersServiceMock.findByEmail(email)).thenReturn(
                emptyServiceResponse,
            );

            const res = await authenticationService.createWeb3User(
                email,
                username,
                registerPayload[0].toString(),
                address,
                registerSignature.hex,
                'en',
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('username_already_in_use');

            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
        });

        test('address already in use', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;
            const web3TokensServiceMock: Web3TokensService = this
                .web3TokensServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);

            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(
                1,
            );
            const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(
                email,
                username,
            );
            const registerSignature = await web3RegisterSigner.sign(
                wallet.privateKey,
                registerPayload[1],
            );

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    wallet: null,
                    address,
                    password: null,
                    type: 'web3',
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<
                UserDto
            >> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByAddress(address)).thenReturn(
                Promise.resolve(serviceResponse),
            );
            when(usersServiceMock.findByUsername(username)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByEmail(email)).thenReturn(
                emptyServiceResponse,
            );

            const res = await authenticationService.createWeb3User(
                email,
                username,
                registerPayload[0].toString(),
                address,
                registerSignature.hex,
                'en',
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('address_already_in_use');

            verify(usersServiceMock.findByAddress(address)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
        });

        test('signature in the future', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;
            const web3TokensServiceMock: Web3TokensService = this
                .web3TokensServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const other_wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(other_wallet.address);

            const future = Date.now() + 1000000;
            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(
                1,
            );
            const registerPayload = web3RegisterSigner.generatePayload(
                {
                    email,
                    username,
                    timestamp: future,
                },
                'Web3Register',
            );
            const registerSignature = await web3RegisterSigner.sign(
                wallet.privateKey,
                registerPayload,
            );

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    wallet: null,
                    address,
                    type: 'web3',
                    password: null,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<
                UserDto
            >> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByAddress(address)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByEmail(email)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByUsername(username)).thenReturn(
                emptyServiceResponse,
            );

            const res = await authenticationService.createWeb3User(
                email,
                username,
                future.toString(),
                address,
                registerSignature.hex,
                'en',
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('signature_is_in_the_future');

            verify(usersServiceMock.findByAddress(address)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
        });
        test('invalid signature', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;
            const web3TokensServiceMock: Web3TokensService = this
                .web3TokensServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const other_wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(other_wallet.address);

            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(
                1,
            );
            const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(
                email,
                username,
            );
            const registerSignature = await web3RegisterSigner.sign(
                wallet.privateKey,
                registerPayload[1],
            );

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    wallet: null,
                    address,
                    type: 'web3',
                    password: null,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<
                UserDto
            >> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByAddress(address)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByEmail(email)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByUsername(username)).thenReturn(
                emptyServiceResponse,
            );

            const res = await authenticationService.createWeb3User(
                email,
                username,
                registerPayload[0].toString(),
                address,
                registerSignature.hex,
                'en',
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
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;
            const refractFactoryV0Service: RefractFactoryV0Service =
                context.refractFactoryV0Service;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);
            const encrypted = JSON.parse(encrypted_string);

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    wallet: encrypted_string,
                    address: resultAddress,
                    type: 't721',
                    password: hashedp,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<
                UserDto
            >> = Promise.resolve({
                response: null,
                error: null,
            });

            when(
                usersServiceMock.create(
                    deepEqual({
                        email,
                        username,
                        wallet: encrypted_string,
                        address: resultAddress,
                        type: 't721',
                        password: anyString(),
                        role: 'authenticated',
                        locale: 'en',
                    }),
                ),
            ).thenReturn(Promise.resolve(serviceResponse));

            when(usersServiceMock.findByAddress(resultAddress)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByEmail(email)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByUsername(username)).thenReturn(
                emptyServiceResponse,
            );

            const res = await authenticationService.createT721User(
                email,
                hashedp,
                username,
                encrypted,
                'en',
            );

            expect(res.response).toBeDefined();
            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                email,
                username,
                wallet: encrypted_string,
                address: resultAddress,
                type: 't721',
                id: '0',
                role: 'authenticated',
                valid: false,
                locale: 'en',
            });

            verify(
                usersServiceMock.create(
                    deepEqual({
                        email,
                        username,
                        wallet: encrypted_string,
                        address: resultAddress,
                        type: 't721',
                        password: anyString(),
                        role: 'authenticated',
                        locale: 'en',
                    }),
                ),
            ).called();

            verify(usersServiceMock.findByAddress(resultAddress)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
        });

        test('email already in use', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
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
                    wallet: encrypted,
                    address: toAcceptedAddressFormat(address),
                    type: 't721',
                    password: hashedp,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                },
                error: null,
            };

            when(usersServiceMock.findByEmail(email)).thenReturn(
                Promise.resolve(serviceResponse),
            );

            const res = await authenticationService.createT721User(
                email,
                hashedp,
                username,
                JSON.parse(encrypted),
                'en',
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('email_already_in_use');
            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('username already in use', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
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
                    wallet: encrypted,
                    address: toAcceptedAddressFormat(address),
                    type: 't721',
                    password: hashedp,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<
                UserDto
            >> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByUsername(username)).thenReturn(
                Promise.resolve(serviceResponse),
            );

            const res = await authenticationService.createT721User(
                email,
                hashedp,
                username,
                JSON.parse(encrypted),
                'en',
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('username_already_in_use');
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('invalid wallet format', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted = await encryptWallet(wallet, hashedp);

            const emptyServiceResponse: Promise<ServiceResponse<
                UserDto
            >> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByUsername(username)).thenReturn(
                emptyServiceResponse,
            );

            const parsed_encrypted = JSON.parse(encrypted);
            parsed_encrypted.version = 2;

            const res = await authenticationService.createT721User(
                email,
                hashedp,
                username,
                parsed_encrypted,
                'en',
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('invalid_wallet_format');
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('address already in use', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted = await encryptWallet(wallet, hashedp);

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    wallet: encrypted,
                    address: resultAddress,
                    type: 't721',
                    password: hashedp,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<
                UserDto
            >> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByUsername(username)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByAddress(resultAddress)).thenReturn(
                Promise.resolve(serviceResponse),
            );

            const res = await authenticationService.createT721User(
                email,
                hashedp,
                username,
                JSON.parse(encrypted),
                'en',
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('address_already_in_use');
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByAddress(resultAddress)).called();
        });

        test('invalid password', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted = await encryptWallet(wallet, hashedp);

            const emptyServiceResponse: Promise<ServiceResponse<
                UserDto
            >> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByUsername(username)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByAddress(resultAddress)).thenReturn(
                emptyServiceResponse,
            );

            const res = await authenticationService.createT721User(
                email,
                hashedp.slice(4),
                username,
                JSON.parse(encrypted),
                'en',
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('password_should_be_keccak256');
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByAddress(resultAddress)).called();
        });

        test('email query internal error', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted = await encryptWallet(wallet, hashedp);

            when(usersServiceMock.findByEmail(email)).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'unexpected_error',
                }),
            );

            const res = await authenticationService.createT721User(
                email,
                hashedp.slice(4),
                username,
                JSON.parse(encrypted),
                'en',
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('unexpected_error');
            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('username query internal error', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted = await encryptWallet(wallet, hashedp);

            const emptyServiceResponse: Promise<ServiceResponse<
                UserDto
            >> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByUsername(username)).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'unexpected_error',
                }),
            );

            const res = await authenticationService.createT721User(
                email,
                hashedp.slice(4),
                username,
                JSON.parse(encrypted),
                'en',
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('unexpected_error');
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
        });

        test('address query internal error', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted = await encryptWallet(wallet, hashedp);

            const emptyServiceResponse: Promise<ServiceResponse<
                UserDto
            >> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByUsername(username)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByAddress(resultAddress)).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'unexpected_error',
                }),
            );

            const res = await authenticationService.createT721User(
                email,
                hashedp.slice(4),
                username,
                JSON.parse(encrypted),
                'en',
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('unexpected_error');
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByAddress(resultAddress)).called();
        });

        test('create user internal error', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);
            const encrypted = JSON.parse(encrypted_string);

            const emptyServiceResponse: Promise<ServiceResponse<
                UserDto
            >> = Promise.resolve({
                response: null,
                error: null,
            });

            when(
                usersServiceMock.create(
                    deepEqual({
                        email,
                        username,
                        wallet: encrypted_string,
                        address: resultAddress,
                        type: 't721',
                        password: anyString(),
                        role: 'authenticated',
                        locale: 'en',
                    }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'unexpected_error',
                }),
            );

            when(usersServiceMock.findByAddress(resultAddress)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByEmail(email)).thenReturn(
                emptyServiceResponse,
            );
            when(usersServiceMock.findByUsername(username)).thenReturn(
                emptyServiceResponse,
            );

            const res = await authenticationService.createT721User(
                email,
                hashedp,
                username,
                encrypted,
                'en',
            );

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
                        wallet: encrypted_string,
                        address: resultAddress,
                        type: 't721',
                        password: anyString(),
                        role: 'authenticated',
                        locale: 'en',
                    }),
                ),
            ).called();
        });
    });

    describe('validateUser', function() {
        test('checks valid user', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
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
                    wallet: encrypted_string,
                    address: toAcceptedAddressFormat(address),
                    type: 't721',
                    password: bcrypted,
                    id: '0',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                },
                error: null,
            };

            when(usersServiceMock.findByEmail(email)).thenReturn(
                Promise.resolve(serviceResponse),
            );

            const res = await authenticationService.validateUser(
                email,
                hashedp,
            );

            expect(res.response).toEqual({
                username,
                email,
                wallet: encrypted_string,
                address: toAcceptedAddressFormat(address),
                type: 't721',
                id: '0',
                role: 'authenticated',
                locale: 'en',
                valid: false,
            });
            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('check errors', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));

            const serviceResponse: ServiceResponse<UserDto> = {
                response: null,
                error: 'unexpected_error',
            };

            when(usersServiceMock.findByEmail(email)).thenReturn(
                Promise.resolve(serviceResponse),
            );

            const res = await authenticationService.validateUser(
                email,
                hashedp,
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('unexpected_error');
            verify(usersServiceMock.findByEmail(email)).called();
        });

        test('invalid credentials', async function() {
            const authenticationService: AuthenticationService =
                context.authenticationService;
            const usersServiceMock: UsersService = context.usersServiceMock;

            const email = 'test@test.com';
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));

            const serviceResponse: ServiceResponse<UserDto> = {
                response: null,
                error: null,
            };

            when(usersServiceMock.findByEmail(email)).thenReturn(
                Promise.resolve(serviceResponse),
            );

            const res = await authenticationService.validateUser(
                email,
                hashedp,
            );

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('invalid_credentials');
            verify(usersServiceMock.findByEmail(email)).called();
        });
    });
});
