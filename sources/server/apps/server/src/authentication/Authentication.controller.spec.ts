import { Test, TestingModule }                     from '@nestjs/testing';
import { AuthenticationController }                from './Authentication.controller';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { AuthenticationService }                   from './Authentication.service';
import {
    createWallet,
    encryptWallet,
    keccak256, toAcceptedAddressFormat,
    toAcceptedKeccak256Format,
    Wallet,
    Web3RegisterSigner
} from '@ticket721sources/global';
import { LocalRegisterInputDto }                   from './dto/LocalRegisterInput.dto';
import { JwtModule }                               from '@nestjs/jwt';
import { StatusCodes }                             from '../utils/codes';
import { ConfigService }                           from '@lib/common/config/Config.service';
import { Web3RegisterInputDto }                    from '@app/server/authentication/dto/Web3RegisterInput.dto';

const context: {
    authenticationController: AuthenticationController,
    authenticationServiceMock: AuthenticationService,
    configServiceMock: ConfigService
} = {
    authenticationController: null,
    authenticationServiceMock: null,
    configServiceMock: null,
};

describe('Authentication Controller', function() {

    beforeEach(async function() {

        const authenticationServiceMock: AuthenticationService = mock(AuthenticationService);
        const configServiceMock: ConfigService = mock(ConfigService);

        const AuthenticationServiceProvider = {
            provide: AuthenticationService,
            useValue: instance(authenticationServiceMock),
        };

        const ConfigServiceProvider = {
            provide: ConfigService,
            useValue: instance(configServiceMock),
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
            ],
            controllers: [
                AuthenticationController,
            ],
        }).compile();

        context.authenticationController = module.get<AuthenticationController>(AuthenticationController);
        context.authenticationServiceMock = authenticationServiceMock;
        context.configServiceMock = configServiceMock;

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

            when(authenticationServiceMock.createWeb3User(email, username, register_payload[0].toString(), address, register_signature.hex)).thenReturn(Promise.resolve({
                response: {
                    username,
                    email,
                    wallet: null,
                    type: 'web3',
                    address,
                    id: '0',
                    role: 'authenticated',
                }, error: null,
            }));

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
            expect(res.user).toEqual({
                username,
                email,
                wallet: null,
                type: 'web3',
                address: toAcceptedAddressFormat(address),
                id: '0',
                role: 'authenticated',
            });
            expect(res.token).toBeDefined();

            verify(authenticationServiceMock.createWeb3User(email, username, register_payload[0].toString(), address, register_signature.hex)).called();

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

            when(authenticationServiceMock.createWeb3User(email, username, register_payload[0].toString(), address, register_signature.hex)).thenReturn(Promise.resolve({
                response: null,
                error: 'email_already_in_use',
            }));

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

            verify(authenticationServiceMock.createWeb3User(email, username, register_payload[0].toString(), address, register_signature.hex)).called();

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

            when(authenticationServiceMock.createWeb3User(email, username, register_payload[0].toString(), address, register_signature.hex)).thenReturn(Promise.resolve({
                response: null,
                error: 'username_already_in_use',
            }));

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

            verify(authenticationServiceMock.createWeb3User(email, username, register_payload[0].toString(), address, register_signature.hex)).called();

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

            when(authenticationServiceMock.createWeb3User(email, username, register_payload[0].toString(), address, register_signature.hex)).thenReturn(Promise.resolve({
                response: null,
                error: 'address_already_in_use',
            }));

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

            verify(authenticationServiceMock.createWeb3User(email, username, register_payload[0].toString(), address, register_signature.hex)).called();

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

            when(authenticationServiceMock.createWeb3User(email, username, register_payload[0].toString(), address, register_signature.hex)).thenReturn(Promise.resolve({
                response: null,
                error: 'invalid_signature',
            }));

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

            verify(authenticationServiceMock.createWeb3User(email, username, register_payload[0].toString(), address, register_signature.hex)).called();

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

            when(authenticationServiceMock.createWeb3User(email, username, register_payload[0].toString(), address, register_signature.hex)).thenReturn(Promise.resolve({
                response: null,
                error: 'signature_timed_out',
            }));

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

            verify(authenticationServiceMock.createWeb3User(email, username, register_payload[0].toString(), address, register_signature.hex)).called();

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

            when(authenticationServiceMock.createWeb3User(email, username, register_payload[0].toString(), address, register_signature.hex)).thenReturn(Promise.resolve({
                response: null,
                error: 'signature_is_in_the_future',
            }));

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

            verify(authenticationServiceMock.createWeb3User(email, username, register_payload[0].toString(), address, register_signature.hex)).called();

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

            when(authenticationServiceMock.createWeb3User(email, username, register_payload[0].toString(), address, register_signature.hex)).thenReturn(Promise.resolve({
                response: null,
                error: 'signature_check_fail',
            }));

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

            verify(authenticationServiceMock.createWeb3User(email, username, register_payload[0].toString(), address, register_signature.hex)).called();

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

            when(authenticationServiceMock.createWeb3User(email, username, register_payload[0].toString(), address, register_signature.hex)).thenReturn(Promise.resolve({
                response: null,
                error: 'this_error_does_not_exist',
            }));

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

            verify(authenticationServiceMock.createWeb3User(email, username, register_payload[0].toString(), address, register_signature.hex)).called();

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

            when(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).thenReturn(Promise.resolve({
                response: {
                    username,
                    email,
                    wallet: JSON.stringify(encrypted),
                    type: 't721',
                    address,
                    id: '0',
                    role: 'authenticated',
                }, error: null,
            }));

            const user: LocalRegisterInputDto = {
                username: 'salut',
                password: hashedp,
                email: 'test@test.com',
                wallet: encrypted,
            };

            const res = await authenticationController.localRegister(user);
            expect(res.user).toBeDefined();
            expect(res.token).toBeDefined();
            expect(res.user).toEqual({
                username,
                email,
                wallet: JSON.stringify(encrypted),
                type: 't721',
                address: toAcceptedAddressFormat(address),
                id: '0',
                role: 'authenticated',
            });
            expect(res.token).toBeDefined();

            verify(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).called();

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

            when(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).thenReturn(Promise.resolve({
                response: null,
                error: 'email_already_in_use',
            }));

            const user: LocalRegisterInputDto = {
                username: 'salut',
                password: hashedp,
                email: 'test@test.com',
                wallet: encrypted,
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

            verify(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).called();

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

            when(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).thenReturn(Promise.resolve({
                response: null,
                error: 'username_already_in_use',
            }));

            const user: LocalRegisterInputDto = {
                username: 'salut',
                password: hashedp,
                email: 'test@test.com',
                wallet: encrypted,
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

            verify(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).called();

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

            when(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).thenReturn(Promise.resolve({
                response: null,
                error: 'address_already_in_use',
            }));

            const user: LocalRegisterInputDto = {
                username: 'salut',
                password: hashedp,
                email: 'test@test.com',
                wallet: encrypted,
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

            verify(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).called();

        });

        test('invalid wallet format - should error with 422', async function() {

            const authenticationController: AuthenticationController = context.authenticationController;
            const authenticationServiceMock: AuthenticationService = context.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);
            const encrypted = JSON.parse(encrypted_string);

            when(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).thenReturn(Promise.resolve({
                response: null,
                error: 'invalid_wallet_format',
            }));

            const user: LocalRegisterInputDto = {
                username: 'salut',
                password: hashedp,
                email: 'test@test.com',
                wallet: encrypted,
            };

            await expect(authenticationController.localRegister(user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.UnprocessableEntity,
                    message: 'invalid_wallet_format',
                },
                status: StatusCodes.UnprocessableEntity,
                message: {
                    status: StatusCodes.UnprocessableEntity,
                    message: 'invalid_wallet_format',
                },
            });

            verify(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).called();

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

            when(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).thenReturn(Promise.resolve({
                response: null,
                error: 'password_should_be_keccak256',
            }));

            const user: LocalRegisterInputDto = {
                username: 'salut',
                password: hashedp,
                email: 'test@test.com',
                wallet: encrypted,
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

            verify(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).called();

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

            when(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).thenReturn(Promise.resolve({
                response: null,
                error: 'this_error_does_not_exist',
            }));

            const user: LocalRegisterInputDto = {
                username: 'salut',
                password: hashedp,
                email: 'test@test.com',
                wallet: encrypted,
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

            verify(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).called();

        });

    });

});
