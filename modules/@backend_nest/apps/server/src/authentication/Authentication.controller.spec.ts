import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './Authentication.controller';
import { instance, mock, verify, when } from 'ts-mockito';
import { AuthenticationService } from './Authentication.service';
import {
    createWallet,
    encryptWallet,
    keccak256,
    toAcceptedAddressFormat,
    toAcceptedKeccak256Format,
    Wallet,
    Web3RegisterSigner,
} from '@common/global';
import { LocalRegisterInputDto } from './dto/LocalRegisterInput.dto';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@lib/common/config/Config.service';
import { Web3RegisterInputDto } from '@app/server/authentication/dto/Web3RegisterInput.dto';
import { getQueueToken } from '@nestjs/bull';
import { Job, JobOptions } from 'bull';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { UnprocessableEntityException } from '@nestjs/common';
import { ResetPasswordTaskDto } from '@app/server/authentication/dto/ResetPasswordTask.dto';
import { generatePassword } from '../../test/utils';
import { ResetPasswordInputDto } from '@app/server/authentication/dto/ResetPasswordInputDto';
import { PasswordChangeDto } from '@app/server/authentication/dto/PasswordChange.dto';

class QueueMock<T = any> {
    add(name: string, data: T, opts?: JobOptions): Promise<Job<T>> {
        return null;
    }
}

const context: {
    authenticationController: AuthenticationController;
    authenticationServiceMock: AuthenticationService;
    configServiceMock: ConfigService;
    mailingQueueMock: QueueMock;
    jwtServiceMock: JwtService;
} = {
    authenticationController: null,
    authenticationServiceMock: null,
    configServiceMock: null,
    mailingQueueMock: null,
    jwtServiceMock: null,
};

describe('Authentication Controller', function() {
    beforeEach(async function() {
        const authenticationServiceMock: AuthenticationService = mock(AuthenticationService);
        const configServiceMock: ConfigService = mock(ConfigService);
        const mailingQueueMock: QueueMock = mock(QueueMock);
        const jwtServiceMock: JwtService = mock(JwtService);

        when(configServiceMock.get('NODE_ENV')).thenReturn('production');

        const AuthenticationServiceProvider = {
            provide: AuthenticationService,
            useValue: instance(authenticationServiceMock),
        };

        const ConfigServiceProvider = {
            provide: ConfigService,
            useValue: instance(configServiceMock),
        };

        const BullMailingQueueProvider = {
            provide: getQueueToken('mailing'),
            useValue: instance(mailingQueueMock),
        };

        const JwtServiceProvider = {
            provide: JwtService,
            useValue: instance(jwtServiceMock),
        };

        const module: TestingModule = await Test.createTestingModule({
            imports: [
                JwtModule.register({
                    secret: 'secret',
                }),
            ],
            providers: [
                AuthenticationServiceProvider,
                ConfigServiceProvider,
                BullMailingQueueProvider,
                JwtServiceProvider,
            ],
            controllers: [AuthenticationController],
        }).compile();

        context.authenticationController = module.get<AuthenticationController>(AuthenticationController);
        context.authenticationServiceMock = authenticationServiceMock;
        context.configServiceMock = configServiceMock;
        context.mailingQueueMock = mailingQueueMock;
        context.jwtServiceMock = jwtServiceMock;
    });

    describe('web3Register', function() {
        test('should create a user', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const register_payload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const register_signature = await web3RegisterSigner.sign(wallet.privateKey, register_payload[1]);

            when(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).thenReturn(
                Promise.resolve({
                    response: {
                        username,
                        email,
                        type: 'web3',
                        address,
                        id: '0',
                        role: 'authenticated',
                        locale: 'en',
                        valid: false,
                    },
                    error: null,
                }),
            );

            const user: Web3RegisterInputDto = {
                username: 'salut',
                email: 'test@test.com',
                address,
                timestamp: register_payload[0].toString(),
                signature: register_signature.hex,
            };

            const res = await authenticationController.web3Register(user);
            expect(res.user).toBeDefined();
            expect(res.token).toBeDefined();
            expect(res.validationToken).toBeUndefined();
            expect(res.user).toEqual({
                username,
                email,
                type: 'web3',
                address: toAcceptedAddressFormat(address),
                id: '0',
                role: 'authenticated',
                locale: 'en',
                valid: false,
            });
            expect(res.token).toBeDefined();

            verify(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).called();
        });

        test('should create a user & return validation token', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;
            const configServiceMock: ConfigService = context.configServiceMock;

            when(configServiceMock.get('NODE_ENV')).thenReturn('development');

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const register_payload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const register_signature = await web3RegisterSigner.sign(wallet.privateKey, register_payload[1]);

            when(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).thenReturn(
                Promise.resolve({
                    response: {
                        username,
                        email,
                        type: 'web3',
                        address,
                        id: '0',
                        role: 'authenticated',
                        locale: 'en',
                        valid: false,
                    },
                    error: null,
                }),
            );

            const user: Web3RegisterInputDto = {
                username: 'salut',
                email: 'test@test.com',
                address,
                timestamp: register_payload[0].toString(),
                signature: register_signature.hex,
            };

            const res = await authenticationController.web3Register(user);
            expect(res.user).toBeDefined();
            expect(res.token).toBeDefined();
            expect(res.validationToken).toBeDefined();
            expect(res.user).toEqual({
                username,
                email,
                type: 'web3',
                address: toAcceptedAddressFormat(address),
                id: '0',
                role: 'authenticated',
                locale: 'en',
                valid: false,
            });
            expect(res.token).toBeDefined();

            verify(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).called();
        });

        test('email already in use', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const register_payload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const register_signature = await web3RegisterSigner.sign(wallet.privateKey, register_payload[1]);

            when(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'email_already_in_use',
                }),
            );

            const user: Web3RegisterInputDto = {
                username: 'salut',
                email: 'test@test.com',
                address,
                timestamp: register_payload[0].toString(),
                signature: register_signature.hex,
            };

            await expect(authenticationController.web3Register(user)).rejects.toMatchObject({
                response: {
                    status: 409,
                    message: 'email_already_in_use',
                },
                status: 409,
                message: {
                    status: 409,
                    message: 'email_already_in_use',
                },
            });

            verify(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).called();
        });

        test('username already in use', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const register_payload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const register_signature = await web3RegisterSigner.sign(wallet.privateKey, register_payload[1]);

            when(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'username_already_in_use',
                }),
            );

            const user: Web3RegisterInputDto = {
                username: 'salut',
                email: 'test@test.com',
                address,
                timestamp: register_payload[0].toString(),
                signature: register_signature.hex,
            };

            await expect(authenticationController.web3Register(user)).rejects.toMatchObject({
                response: {
                    status: 409,
                    message: 'username_already_in_use',
                },
                status: 409,
                message: {
                    status: 409,
                    message: 'username_already_in_use',
                },
            });

            verify(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).called();
        });

        test('address already in use', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const register_payload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const register_signature = await web3RegisterSigner.sign(wallet.privateKey, register_payload[1]);

            when(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'address_already_in_use',
                }),
            );

            const user: Web3RegisterInputDto = {
                username: 'salut',
                email: 'test@test.com',
                address,
                timestamp: register_payload[0].toString(),
                signature: register_signature.hex,
            };

            await expect(authenticationController.web3Register(user)).rejects.toMatchObject({
                response: {
                    status: 409,
                    message: 'address_already_in_use',
                },
                status: 409,
                message: {
                    status: 409,
                    message: 'address_already_in_use',
                },
            });

            verify(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).called();
        });

        test('invalid signature', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const register_payload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const register_signature = await web3RegisterSigner.sign(wallet.privateKey, register_payload[1]);

            when(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'invalid_signature',
                }),
            );

            const user: Web3RegisterInputDto = {
                username: 'salut',
                email: 'test@test.com',
                address,
                timestamp: register_payload[0].toString(),
                signature: register_signature.hex,
            };

            await expect(authenticationController.web3Register(user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.Unauthorized,
                    message: 'invalid_signature',
                },
                status: StatusCodes.Unauthorized,
                message: {
                    status: StatusCodes.Unauthorized,
                    message: 'invalid_signature',
                },
            });

            verify(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).called();
        });

        test('signature timed out', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const register_payload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const register_signature = await web3RegisterSigner.sign(wallet.privateKey, register_payload[1]);

            when(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'signature_timed_out',
                }),
            );

            const user: Web3RegisterInputDto = {
                username: 'salut',
                email: 'test@test.com',
                address,
                timestamp: register_payload[0].toString(),
                signature: register_signature.hex,
            };

            await expect(authenticationController.web3Register(user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.Unauthorized,
                    message: 'signature_timed_out',
                },
                status: StatusCodes.Unauthorized,
                message: {
                    status: StatusCodes.Unauthorized,
                    message: 'signature_timed_out',
                },
            });

            verify(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).called();
        });

        test('signature is in the future', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const register_payload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const register_signature = await web3RegisterSigner.sign(wallet.privateKey, register_payload[1]);

            when(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'signature_is_in_the_future',
                }),
            );

            const user: Web3RegisterInputDto = {
                username: 'salut',
                email: 'test@test.com',
                address,
                timestamp: register_payload[0].toString(),
                signature: register_signature.hex,
            };

            await expect(authenticationController.web3Register(user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.Unauthorized,
                    message: 'signature_is_in_the_future',
                },
                status: StatusCodes.Unauthorized,
                message: {
                    status: StatusCodes.Unauthorized,
                    message: 'signature_is_in_the_future',
                },
            });

            verify(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).called();
        });

        test('signature check fail', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const register_payload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const register_signature = await web3RegisterSigner.sign(wallet.privateKey, register_payload[1]);

            when(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'signature_check_fail',
                }),
            );

            const user: Web3RegisterInputDto = {
                username: 'salut',
                email: 'test@test.com',
                address,
                timestamp: register_payload[0].toString(),
                signature: register_signature.hex,
            };

            await expect(authenticationController.web3Register(user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.UnprocessableEntity,
                    message: 'signature_check_fail',
                },
                status: StatusCodes.UnprocessableEntity,
                message: {
                    status: StatusCodes.UnprocessableEntity,
                    message: 'signature_check_fail',
                },
            });

            verify(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).called();
        });

        test('unexpected error', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const register_payload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const register_signature = await web3RegisterSigner.sign(wallet.privateKey, register_payload[1]);

            when(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'this_error_does_not_exist',
                }),
            );

            const user: Web3RegisterInputDto = {
                username: 'salut',
                email: 'test@test.com',
                address,
                timestamp: register_payload[0].toString(),
                signature: register_signature.hex,
            };

            await expect(authenticationController.web3Register(user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.InternalServerError,
                    message: 'this_error_does_not_exist',
                },
                status: StatusCodes.InternalServerError,
                message: {
                    status: StatusCodes.InternalServerError,
                    message: 'this_error_does_not_exist',
                },
            });

            verify(
                authenticationServiceMock.createWeb3User(
                    email,
                    username,
                    register_payload[0].toString(),
                    address,
                    register_signature.hex,
                    'en',
                ),
            ).called();
        });
    });

    describe('localRegister', function() {
        test('should create a user', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted = JSON.parse(await encryptWallet(wallet, hashedp));

            when(authenticationServiceMock.createT721User(email, hashedp, username, 'en')).thenReturn(
                Promise.resolve({
                    response: {
                        username,
                        email,
                        wallet: JSON.stringify(encrypted),
                        type: 't721',
                        address,
                        id: '0',
                        role: 'authenticated',
                        locale: 'en',
                        valid: false,
                    },
                    error: null,
                }),
            );

            const user: LocalRegisterInputDto = {
                username: 'salut',
                password: hashedp,
                email: 'test@test.com',
            };

            const res = await authenticationController.localRegister(user);
            expect(res.user).toBeDefined();
            expect(res.validationToken).toBeUndefined();
            expect(res.token).toBeDefined();
            expect(res.user).toEqual({
                username,
                email,
                wallet: JSON.stringify(encrypted),
                type: 't721',
                address: toAcceptedAddressFormat(address),
                id: '0',
                role: 'authenticated',
                locale: 'en',
                valid: false,
            });
            expect(res.token).toBeDefined();

            verify(authenticationServiceMock.createT721User(email, hashedp, username, 'en')).called();
        });

        test('should create a user & return validation token in development mode', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;
            const configServiceMock: ConfigService = context.configServiceMock;

            when(configServiceMock.get('NODE_ENV')).thenReturn('development');

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted = JSON.parse(await encryptWallet(wallet, hashedp));

            when(authenticationServiceMock.createT721User(email, hashedp, username, 'en')).thenReturn(
                Promise.resolve({
                    response: {
                        username,
                        email,
                        wallet: JSON.stringify(encrypted),
                        type: 't721',
                        address,
                        id: '0',
                        role: 'authenticated',
                        locale: 'en',
                        valid: false,
                    },
                    error: null,
                }),
            );

            const user: LocalRegisterInputDto = {
                username: 'salut',
                password: hashedp,
                email: 'test@test.com',
            };

            const res = await authenticationController.localRegister(user);
            expect(res.user).toBeDefined();
            expect(res.token).toBeDefined();
            expect(res.validationToken).toBeDefined();
            expect(res.user).toEqual({
                username,
                email,
                wallet: JSON.stringify(encrypted),
                type: 't721',
                address: toAcceptedAddressFormat(address),
                id: '0',
                role: 'authenticated',
                locale: 'en',
                valid: false,
            });
            expect(res.token).toBeDefined();

            verify(authenticationServiceMock.createT721User(email, hashedp, username, 'en')).called();
        });

        test('email already in use - should error with 409', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);
            const encrypted = JSON.parse(encrypted_string);

            when(authenticationServiceMock.createT721User(email, hashedp, username, 'en')).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'email_already_in_use',
                }),
            );

            const user: LocalRegisterInputDto = {
                username: 'salut',
                password: hashedp,
                email: 'test@test.com',
            };

            await expect(authenticationController.localRegister(user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.Conflict,
                    message: 'email_already_in_use',
                },
                status: StatusCodes.Conflict,
                message: {
                    status: StatusCodes.Conflict,
                    message: 'email_already_in_use',
                },
            });

            verify(authenticationServiceMock.createT721User(email, hashedp, username, 'en')).called();
        });

        test('username already in use - should error with 409', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);
            const encrypted = JSON.parse(encrypted_string);

            when(authenticationServiceMock.createT721User(email, hashedp, username, 'en')).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'username_already_in_use',
                }),
            );

            const user: LocalRegisterInputDto = {
                username: 'salut',
                password: hashedp,
                email: 'test@test.com',
            };

            await expect(authenticationController.localRegister(user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.Conflict,
                    message: 'username_already_in_use',
                },
                status: StatusCodes.Conflict,
                message: {
                    status: StatusCodes.Conflict,
                    message: 'username_already_in_use',
                },
            });

            verify(authenticationServiceMock.createT721User(email, hashedp, username, 'en')).called();
        });

        test('address already in use - should error with 409', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);
            const encrypted = JSON.parse(encrypted_string);

            when(authenticationServiceMock.createT721User(email, hashedp, username, 'en')).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'address_already_in_use',
                }),
            );

            const user: LocalRegisterInputDto = {
                username: 'salut',
                password: hashedp,
                email: 'test@test.com',
            };

            await expect(authenticationController.localRegister(user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.Conflict,
                    message: 'address_already_in_use',
                },
                status: StatusCodes.Conflict,
                message: {
                    status: StatusCodes.Conflict,
                    message: 'address_already_in_use',
                },
            });

            verify(authenticationServiceMock.createT721User(email, hashedp, username, 'en')).called();
        });

        test('invalid password format - should error with 422', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);
            const encrypted = JSON.parse(encrypted_string);

            when(authenticationServiceMock.createT721User(email, hashedp, username, 'en')).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'password_should_be_keccak256',
                }),
            );

            const user: LocalRegisterInputDto = {
                username: 'salut',
                password: hashedp,
                email: 'test@test.com',
            };

            await expect(authenticationController.localRegister(user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.UnprocessableEntity,
                    message: 'password_should_be_keccak256',
                },
                status: StatusCodes.UnprocessableEntity,
                message: {
                    status: StatusCodes.UnprocessableEntity,
                    message: 'password_should_be_keccak256',
                },
            });

            verify(authenticationServiceMock.createT721User(email, hashedp, username, 'en')).called();
        });

        test('unknown error - should error with 500', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);
            const encrypted = JSON.parse(encrypted_string);

            when(authenticationServiceMock.createT721User(email, hashedp, username, 'en')).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'this_error_does_not_exist',
                }),
            );

            const user: LocalRegisterInputDto = {
                username: 'salut',
                password: hashedp,
                email: 'test@test.com',
            };

            await expect(authenticationController.localRegister(user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.InternalServerError,
                    message: 'this_error_does_not_exist',
                },
                status: StatusCodes.InternalServerError,
                message: {
                    status: StatusCodes.InternalServerError,
                    message: 'this_error_does_not_exist',
                },
            });

            verify(authenticationServiceMock.createT721User(email, hashedp, username, 'en')).called();
        });
    });

    describe('updatePassword', function() {
        test('Not existing user - Should error 401', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'notExistingEmail@test.com';
            const hashedp = toAcceptedKeccak256Format(keccak256('password'));

            when(authenticationServiceMock.updateUserPassword(email, hashedp)).thenResolve({
                response: null,
                error: 'user_not_found',
            });

            const body: PasswordChangeDto = {
                password: hashedp,
            };

            const user: UserDto = {
                id: '123',
                email: email,
                username: 'salut',
                address: 'blabla',
                password: 'Superpass',
                role: 'authenticated',
                valid: true,
                type: 't721',
                locale: 'fr',
            };

            await expect(authenticationController.updatePassword(body, user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.Unauthorized,
                    message: 'user_not_found',
                },
                status: StatusCodes.Unauthorized,
                message: {
                    status: StatusCodes.Unauthorized,
                    message: 'user_not_found',
                },
            });
        });

        test('invalid password format - should error with 422', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const hashedp = toAcceptedKeccak256Format(keccak256('password'));

            when(authenticationServiceMock.updateUserPassword(email, hashedp)).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'password_should_be_keccak256',
                }),
            );

            const body: PasswordChangeDto = {
                password: hashedp,
            };

            const user: UserDto = {
                id: '123',
                email: email,
                username: 'salut',
                address: 'blabla',
                password: 'Superpass',
                role: 'authenticated',
                valid: true,
                type: 't721',
                locale: 'fr',
            };

            await expect(authenticationController.updatePassword(body, user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.UnprocessableEntity,
                    message: 'password_should_be_keccak256',
                },
                status: StatusCodes.UnprocessableEntity,
                message: {
                    status: StatusCodes.UnprocessableEntity,
                    message: 'password_should_be_keccak256',
                },
            });
        });

        test('internal error - should error 500', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const hashedp = toAcceptedKeccak256Format(keccak256('password'));

            when(authenticationServiceMock.updateUserPassword(email, hashedp)).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'unexpected_error',
                }),
            );

            const body: PasswordChangeDto = {
                password: hashedp,
            };

            const user: UserDto = {
                id: '123',
                email: email,
                username: 'salut',
                address: 'blabla',
                password: 'Superpass',
                role: 'authenticated',
                valid: true,
                type: 't721',
                locale: 'fr',
            };

            await expect(authenticationController.updatePassword(body, user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.InternalServerError,
                    message: 'unexpected_error',
                },
                status: StatusCodes.InternalServerError,
                message: {
                    status: StatusCodes.InternalServerError,
                    message: 'unexpected_error',
                },
            });
        });

        test('should update user password', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));

            when(authenticationServiceMock.updateUserPassword(email, hashedp)).thenReturn(
                Promise.resolve({
                    response: {
                        id: '123',
                        email: email,
                        username: 'salut',
                        address: 'blabla',
                        role: 'authenticated',
                        valid: true,
                        type: 't721',
                        locale: 'fr',
                    },
                    error: null,
                }),
            );

            const body: PasswordChangeDto = {
                password: hashedp,
            };

            const user: UserDto = {
                id: '123',
                email: email,
                username: 'salut',
                address: 'blabla',
                password: 'Superpass',
                role: 'authenticated',
                valid: true,
                type: 't721',
                locale: 'fr',
            };

            await expect(authenticationController.updatePassword(body, user)).resolves.toMatchObject({
                id: '123',
                email: email,
                username: 'salut',
                address: 'blabla',
                role: 'authenticated',
                valid: true,
                type: 't721',
                locale: 'fr',
            });
        });
    });

    describe('validateEmail', function() {
        it('should return updated user', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const jwtServiceMock: JwtService = context.jwtServiceMock;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const username = 'mortimr';
            const email = 'iulian@t721.com';
            const id = '123';
            const locale = 'en';

            when(jwtServiceMock.verifyAsync('test_token')).thenReturn(
                Promise.resolve({
                    username,
                    email,
                    id,
                    locale,
                }),
            );

            const user: PasswordlessUserDto = {
                username,
                id,
                email,
                locale,
                valid: true,
                type: 't721',
                address: '0x...',
                role: 'authenticated',
            };

            when(authenticationServiceMock.validateUserEmail('123')).thenReturn(
                Promise.resolve({
                    error: null,
                    response: user,
                }),
            );

            const res = await authenticationController.validateEmail({
                token: 'test_token',
            });

            expect(res.user).toEqual(user);
        });

        it('should throw on expired token', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const jwtServiceMock: JwtService = context.jwtServiceMock;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const username = 'mortimr';
            const email = 'iulian@t721.com';
            const id = '123';
            const locale = 'en';

            const user: PasswordlessUserDto = {
                username,
                id,
                email,
                locale,
                valid: true,
                type: 't721',
                address: '0x...',
                role: 'authenticated',
            };

            when(jwtServiceMock.verifyAsync('test_token')).thenThrow(new Error('jwt expired'));

            await expect(authenticationController.validateEmail({ token: 'test_token' })).rejects.toMatchObject({
                response: {
                    status: 401,
                    message: 'jwt_expired',
                },
                status: 401,
                message: {
                    status: 401,
                    message: 'jwt_expired',
                },
            });
        });

        it('should throw on invalid signature', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const jwtServiceMock: JwtService = context.jwtServiceMock;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const username = 'mortimr';
            const email = 'iulian@t721.com';
            const id = '123';
            const locale = 'en';

            const user: PasswordlessUserDto = {
                username,
                id,
                email,
                locale,
                valid: true,
                type: 't721',
                address: '0x...',
                role: 'authenticated',
            };

            when(jwtServiceMock.verifyAsync('test_token')).thenThrow(new Error('invalid signature'));

            await expect(authenticationController.validateEmail({ token: 'test_token' })).rejects.toMatchObject({
                response: {
                    status: 401,
                    message: 'invalid_signature',
                },
                status: 401,
                message: {
                    status: 401,
                    message: 'invalid_signature',
                },
            });
        });

        it('should throw on unknown jwt error', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const jwtServiceMock: JwtService = context.jwtServiceMock;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const username = 'mortimr';
            const email = 'iulian@t721.com';
            const id = '123';
            const locale = 'en';

            const user: PasswordlessUserDto = {
                username,
                id,
                email,
                locale,
                valid: true,
                type: 't721',
                address: '0x...',
                role: 'authenticated',
            };

            when(jwtServiceMock.verifyAsync('test_token')).thenThrow(new Error('unknown error'));

            await expect(authenticationController.validateEmail({ token: 'test_token' })).rejects.toMatchObject({
                response: {
                    status: 401,
                    message: 'invalid_signature',
                },
                status: 401,
                message: {
                    status: 401,
                    message: 'invalid_signature',
                },
            });
        });

        it('should throw on invalid auth service response', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const jwtServiceMock: JwtService = context.jwtServiceMock;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const username = 'mortimr';
            const email = 'iulian@t721.com';
            const id = '123';
            const locale = 'en';

            const user: PasswordlessUserDto = {
                username,
                id,
                email,
                locale,
                valid: true,
                type: 't721',
                address: '0x...',
                role: 'authenticated',
            };

            when(jwtServiceMock.verifyAsync('test_token')).thenReturn(
                Promise.resolve({
                    username,
                    email,
                    id,
                    locale,
                }),
            );

            when(authenticationServiceMock.validateUserEmail('123')).thenReturn(
                Promise.resolve({
                    error: 'unexpected_error',
                    response: null,
                }),
            );

            await expect(authenticationController.validateEmail({ token: 'test_token' })).rejects.toMatchObject({
                response: {
                    status: 500,
                    message: 'unexpected_error',
                },
                status: 500,
                message: {
                    status: 500,
                    message: 'unexpected_error',
                },
            });
        });
    });

    describe('resetPassword', function() {
        test('unexpected_error', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';

            when(authenticationServiceMock.getUserIfEmailExists(email)).thenResolve({
                response: null,
                error: 'unexpected_error',
            });

            const user: ResetPasswordInputDto = {
                email: email,
            };

            await expect(authenticationController.resetPassword(user)).rejects.toMatchObject({
                response: {
                    status: 500,
                    message: 'unexpected_error',
                },
                status: 500,
                message: {
                    status: 500,
                    message: 'unexpected_error',
                },
            });

            verify(authenticationServiceMock.getUserIfEmailExists(email)).called();
        });

        test('user_not_found', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';

            when(authenticationServiceMock.getUserIfEmailExists(email)).thenResolve({
                response: null,
                error: null,
            });

            const user: ResetPasswordInputDto = {
                email: email,
            };

            await authenticationController.resetPassword(user);

            verify(authenticationServiceMock.getUserIfEmailExists(email)).called();
        });

        test('reset password successful', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';

            const user: PasswordlessUserDto = {
                username: 'salut',
                id: '123',
                email,
                locale: 'fr',
                valid: true,
                type: 't721',
                address: '0x...',
                role: 'authenticated',
            };

            when(authenticationServiceMock.getUserIfEmailExists(email)).thenResolve({
                response: user,
                error: null,
            });

            const userEmail: ResetPasswordInputDto = {
                email: email,
            };

            const res = await authenticationController.resetPassword(userEmail);

            expect(res.validationToken).toBeUndefined();

            verify(authenticationServiceMock.getUserIfEmailExists(email)).called();
        });

        test('should reset password and return token in developement', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;
            const configServiceMock: ConfigService = context.configServiceMock;

            when(configServiceMock.get('NODE_ENV')).thenReturn('development');

            const user: PasswordlessUserDto = {
                username: 'salut',
                id: '123',
                email: 'test@test.com',
                locale: 'fr',
                valid: true,
                type: 't721',
                address: '0x...',
                role: 'authenticated',
            };

            when(authenticationServiceMock.getUserIfEmailExists(user.email)).thenResolve({
                response: user,
                error: null,
            });

            const userEmail: ResetPasswordInputDto = {
                email: user.email,
            };

            const res = await authenticationController.resetPassword(userEmail);

            expect(res.validationToken).toBeDefined();

            verify(authenticationServiceMock.getUserIfEmailExists(user.email)).called();
        });
    });

    describe('validateResetPassword', function() {
        test('should throw on signature error', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const jwtServiceMock: JwtService = context.jwtServiceMock;

            when(jwtServiceMock.verifyAsync('test_token')).thenThrow(new Error('unknown error'));

            await expect(
                authenticationController.validateResetPassword({
                    token: 'test_token',
                    password: 'anypass',
                }),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.Unauthorized,
                    message: 'invalid_signature',
                },
                status: StatusCodes.Unauthorized,
                message: {
                    status: StatusCodes.Unauthorized,
                    message: 'invalid_signature',
                },
            });
        });

        test('should throw on jwt error', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const jwtServiceMock: JwtService = context.jwtServiceMock;

            when(jwtServiceMock.verifyAsync('test_token')).thenThrow(new Error('jwt expired'));

            await expect(
                authenticationController.validateResetPassword({
                    token: 'test_token',
                    password: 'anypass',
                }),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.Unauthorized,
                    message: 'jwt_expired',
                },
                status: StatusCodes.Unauthorized,
                message: {
                    status: StatusCodes.Unauthorized,
                    message: 'jwt_expired',
                },
            });
        });

        test('internal server error', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const jwtServiceMock: JwtService = context.jwtServiceMock;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const username = 'salut';
            const email = 'test@t721.com';
            const id = '123';
            const locale = 'en';
            const password = generatePassword();

            when(jwtServiceMock.verifyAsync('test_token')).thenReturn(
                Promise.resolve({
                    id,
                    username,
                    email,
                    locale,
                }),
            );

            when(authenticationServiceMock.validateResetPassword(id, password)).thenReturn(
                Promise.resolve({
                    error: 'internal error',
                    response: null,
                }),
            );

            await expect(
                authenticationController.validateResetPassword({ token: 'test_token', password: password }),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.InternalServerError,
                    message: 'internal error',
                },
                status: StatusCodes.InternalServerError,
                message: {
                    status: StatusCodes.InternalServerError,
                    message: 'internal error',
                },
            });
        });

        test('password format error', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const jwtServiceMock: JwtService = context.jwtServiceMock;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const username = 'salut';
            const email = 'test@t721.com';
            const id = '123';
            const locale = 'en';

            when(jwtServiceMock.verifyAsync('test_token')).thenReturn(
                Promise.resolve({
                    id,
                    username,
                    email,
                    locale,
                }),
            );

            when(authenticationServiceMock.validateResetPassword(id, 'BofPass')).thenReturn(
                Promise.resolve({
                    error: 'password_should_be_keccak256',
                    response: null,
                }),
            );

            await expect(
                authenticationController.validateResetPassword({ token: 'test_token', password: 'BofPass' }),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.UnprocessableEntity,
                    message: 'password_should_be_keccak256',
                },
                status: StatusCodes.UnprocessableEntity,
                message: {
                    status: StatusCodes.UnprocessableEntity,
                    message: 'password_should_be_keccak256',
                },
            });
        });

        test('validation successful', async function() {
            const authenticationController: AuthenticationController = context.authenticationController;
            const jwtServiceMock: JwtService = context.jwtServiceMock;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const username = 'salut';
            const email = 'test@t721.com';
            const locale = 'en';

            when(jwtServiceMock.verifyAsync('test_token')).thenReturn(
                Promise.resolve({
                    id: '123',
                    username,
                    email,
                    locale,
                }),
            );

            const user: PasswordlessUserDto = {
                username,
                id: '123',
                email,
                locale,
                valid: true,
                type: 't721',
                address: '0x...',
                role: 'authenticated',
            };

            when(authenticationServiceMock.validateResetPassword(user.id, 'password')).thenReturn(
                Promise.resolve({
                    error: null,
                    response: user,
                }),
            );

            const res = await authenticationController.validateResetPassword({
                token: 'test_token',
                password: 'password',
            });
            expect(res).toEqual({
                user: user,
            });

            verify(authenticationServiceMock.validateResetPassword('123', 'password')).called();
        });
    });
});
