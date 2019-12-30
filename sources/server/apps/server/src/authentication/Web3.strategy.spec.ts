import { Test, TestingModule } from '@nestjs/testing';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { AuthenticationService } from './Authentication.service';
import {
    createWallet,
    toAcceptedAddressFormat,
    Wallet,
    Web3LoginSigner,
} from '@ticket721sources/global';
import { Web3Strategy } from '@app/server/authentication/Web3.strategy';
import { Web3TokensService } from '@app/server/web3token/Web3Tokens.service';
import { StatusCodes } from '@app/server/utils/codes';

const context: {
    localStrategy: Web3Strategy;
    authenticationServiceMock: AuthenticationService;
    web3TokensServiceMock: Web3TokensService;
} = {
    localStrategy: null,
    authenticationServiceMock: null,
    web3TokensServiceMock: null,
};

describe('Web3 Strategy', function() {
    beforeEach(async function() {
        const authenticationServiceMock: AuthenticationService = mock(
            AuthenticationService,
        );
        const web3TokensServiceMock: Web3TokensService = mock(
            Web3TokensService,
        );

        const AuthenticationServiceProvider = {
            provide: AuthenticationService,
            useValue: instance(authenticationServiceMock),
        };

        const Web3TokensServiceProvider = {
            provide: Web3TokensService,
            useValue: instance(web3TokensServiceMock),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthenticationServiceProvider,
                Web3TokensServiceProvider,
                Web3Strategy,
            ],
        }).compile();

        context.localStrategy = module.get<Web3Strategy>(Web3Strategy);
        context.authenticationServiceMock = authenticationServiceMock;
        context.web3TokensServiceMock = web3TokensServiceMock;
    });

    describe('validate', function() {
        it('should validate user', async function() {
            const localStrategy: Web3Strategy = context.localStrategy;
            const authenticationServiceMock: AuthenticationService =
                context.authenticationServiceMock;
            const web3TokensServiceMock: Web3TokensService =
                context.web3TokensServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const login_payload = web3LoginSigner.generateAuthenticationProofPayload();
            const login_signature = await web3LoginSigner.sign(
                wallet.privateKey,
                login_payload[1],
            );
            const timestamp = login_payload[0].toString();

            when(
                authenticationServiceMock.validateWeb3User(
                    timestamp,
                    login_signature.hex,
                ),
            ).thenReturn(
                Promise.resolve({
                    response: {
                        username,
                        email,
                        wallet: null,
                        address,
                        type: 'web3',
                        id: '0',
                        role: 'authenticated',
                    },
                    error: null,
                }),
            );

            when(
                web3TokensServiceMock.check(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: null,
                }),
            );

            when(
                web3TokensServiceMock.register(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: {
                        timestamp: parseInt(timestamp),
                        address,
                    },
                    error: null,
                }),
            );

            const res = await localStrategy.validate(
                timestamp,
                login_signature.hex,
            );

            expect(res).toEqual({
                username,
                email,
                wallet: null,
                address,
                type: 'web3',
                id: '0',
                role: 'authenticated',
            });

            verify(
                authenticationServiceMock.validateWeb3User(
                    timestamp,
                    login_signature.hex,
                ),
            ).called();
            verify(
                web3TokensServiceMock.check(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).called();
            verify(
                web3TokensServiceMock.register(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).called();
        });

        it('invalid signature', async function() {
            const localStrategy: Web3Strategy = context.localStrategy;
            const authenticationServiceMock: AuthenticationService =
                context.authenticationServiceMock;
            const web3TokensServiceMock: Web3TokensService =
                context.web3TokensServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const login_payload = web3LoginSigner.generateAuthenticationProofPayload();
            const login_signature = await web3LoginSigner.sign(
                wallet.privateKey,
                login_payload[1],
            );
            const timestamp = login_payload[0].toString();

            when(
                authenticationServiceMock.validateWeb3User(
                    timestamp,
                    login_signature.hex,
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'invalid_signature',
                }),
            );

            when(
                web3TokensServiceMock.check(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: null,
                }),
            );

            when(
                web3TokensServiceMock.register(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: {
                        timestamp: parseInt(timestamp),
                        address,
                    },
                    error: null,
                }),
            );

            await expect(
                localStrategy.validate(timestamp, login_signature.hex),
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

            verify(
                authenticationServiceMock.validateWeb3User(
                    timestamp,
                    login_signature.hex,
                ),
            ).called();
            verify(
                web3TokensServiceMock.check(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).never();
            verify(
                web3TokensServiceMock.register(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).never();
        });

        it('signature timed out', async function() {
            const localStrategy: Web3Strategy = context.localStrategy;
            const authenticationServiceMock: AuthenticationService =
                context.authenticationServiceMock;
            const web3TokensServiceMock: Web3TokensService =
                context.web3TokensServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const login_payload = web3LoginSigner.generateAuthenticationProofPayload();
            const login_signature = await web3LoginSigner.sign(
                wallet.privateKey,
                login_payload[1],
            );
            const timestamp = login_payload[0].toString();

            when(
                authenticationServiceMock.validateWeb3User(
                    timestamp,
                    login_signature.hex,
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'signature_timed_out',
                }),
            );

            when(
                web3TokensServiceMock.check(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: null,
                }),
            );

            when(
                web3TokensServiceMock.register(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: {
                        timestamp: parseInt(timestamp),
                        address,
                    },
                    error: null,
                }),
            );

            await expect(
                localStrategy.validate(timestamp, login_signature.hex),
            ).rejects.toMatchObject({
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
                authenticationServiceMock.validateWeb3User(
                    timestamp,
                    login_signature.hex,
                ),
            ).called();
            verify(
                web3TokensServiceMock.check(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).never();
            verify(
                web3TokensServiceMock.register(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).never();
        });

        it('signature is in the future', async function() {
            const localStrategy: Web3Strategy = context.localStrategy;
            const authenticationServiceMock: AuthenticationService =
                context.authenticationServiceMock;
            const web3TokensServiceMock: Web3TokensService =
                context.web3TokensServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const login_payload = web3LoginSigner.generateAuthenticationProofPayload();
            const login_signature = await web3LoginSigner.sign(
                wallet.privateKey,
                login_payload[1],
            );
            const timestamp = login_payload[0].toString();

            when(
                authenticationServiceMock.validateWeb3User(
                    timestamp,
                    login_signature.hex,
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'signature_is_in_the_future',
                }),
            );

            when(
                web3TokensServiceMock.check(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: null,
                }),
            );

            when(
                web3TokensServiceMock.register(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: {
                        timestamp: parseInt(timestamp),
                        address,
                    },
                    error: null,
                }),
            );

            await expect(
                localStrategy.validate(timestamp, login_signature.hex),
            ).rejects.toMatchObject({
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
                authenticationServiceMock.validateWeb3User(
                    timestamp,
                    login_signature.hex,
                ),
            ).called();
            verify(
                web3TokensServiceMock.check(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).never();
            verify(
                web3TokensServiceMock.register(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).never();
        });

        it('signature check fail', async function() {
            const localStrategy: Web3Strategy = context.localStrategy;
            const authenticationServiceMock: AuthenticationService =
                context.authenticationServiceMock;
            const web3TokensServiceMock: Web3TokensService =
                context.web3TokensServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const login_payload = web3LoginSigner.generateAuthenticationProofPayload();
            const login_signature = await web3LoginSigner.sign(
                wallet.privateKey,
                login_payload[1],
            );
            const timestamp = login_payload[0].toString();

            when(
                authenticationServiceMock.validateWeb3User(
                    timestamp,
                    login_signature.hex,
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'signature_check_fail',
                }),
            );

            when(
                web3TokensServiceMock.check(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: null,
                }),
            );

            when(
                web3TokensServiceMock.register(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: {
                        timestamp: parseInt(timestamp),
                        address,
                    },
                    error: null,
                }),
            );

            await expect(
                localStrategy.validate(timestamp, login_signature.hex),
            ).rejects.toMatchObject({
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
                authenticationServiceMock.validateWeb3User(
                    timestamp,
                    login_signature.hex,
                ),
            ).called();
            verify(
                web3TokensServiceMock.check(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).never();
            verify(
                web3TokensServiceMock.register(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).never();
        });

        it('users service internal error', async function() {
            const localStrategy: Web3Strategy = context.localStrategy;
            const authenticationServiceMock: AuthenticationService =
                context.authenticationServiceMock;
            const web3TokensServiceMock: Web3TokensService =
                context.web3TokensServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const login_payload = web3LoginSigner.generateAuthenticationProofPayload();
            const login_signature = await web3LoginSigner.sign(
                wallet.privateKey,
                login_payload[1],
            );
            const timestamp = login_payload[0].toString();

            when(
                authenticationServiceMock.validateWeb3User(
                    timestamp,
                    login_signature.hex,
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'this_error_does_not_exist',
                }),
            );

            when(
                web3TokensServiceMock.check(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: null,
                }),
            );

            when(
                web3TokensServiceMock.register(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: {
                        timestamp: parseInt(timestamp),
                        address,
                    },
                    error: null,
                }),
            );

            await expect(
                localStrategy.validate(timestamp, login_signature.hex),
            ).rejects.toMatchObject({
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
                authenticationServiceMock.validateWeb3User(
                    timestamp,
                    login_signature.hex,
                ),
            ).called();
            verify(
                web3TokensServiceMock.check(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).never();
            verify(
                web3TokensServiceMock.register(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).never();
        });

        it('token check unexpected error', async function() {
            const localStrategy: Web3Strategy = context.localStrategy;
            const authenticationServiceMock: AuthenticationService =
                context.authenticationServiceMock;
            const web3TokensServiceMock: Web3TokensService =
                context.web3TokensServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const login_payload = web3LoginSigner.generateAuthenticationProofPayload();
            const login_signature = await web3LoginSigner.sign(
                wallet.privateKey,
                login_payload[1],
            );
            const timestamp = login_payload[0].toString();

            when(
                authenticationServiceMock.validateWeb3User(
                    timestamp,
                    login_signature.hex,
                ),
            ).thenReturn(
                Promise.resolve({
                    response: {
                        username,
                        email,
                        wallet: null,
                        address,
                        type: 'web3',
                        id: '0',
                        role: 'authenticated',
                    },
                    error: null,
                }),
            );

            when(
                web3TokensServiceMock.check(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'unexpected_error',
                }),
            );

            when(
                web3TokensServiceMock.register(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: {
                        timestamp: parseInt(timestamp),
                        address,
                    },
                    error: null,
                }),
            );

            await expect(
                localStrategy.validate(timestamp, login_signature.hex),
            ).rejects.toMatchObject({
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

            verify(
                authenticationServiceMock.validateWeb3User(
                    timestamp,
                    login_signature.hex,
                ),
            ).called();
            verify(
                web3TokensServiceMock.check(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).called();
            verify(
                web3TokensServiceMock.register(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).never();
        });

        it('token duplicate usage', async function() {
            const localStrategy: Web3Strategy = context.localStrategy;
            const authenticationServiceMock: AuthenticationService =
                context.authenticationServiceMock;
            const web3TokensServiceMock: Web3TokensService =
                context.web3TokensServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const login_payload = web3LoginSigner.generateAuthenticationProofPayload();
            const login_signature = await web3LoginSigner.sign(
                wallet.privateKey,
                login_payload[1],
            );
            const timestamp = login_payload[0].toString();

            when(
                authenticationServiceMock.validateWeb3User(
                    timestamp,
                    login_signature.hex,
                ),
            ).thenReturn(
                Promise.resolve({
                    response: {
                        username,
                        email,
                        wallet: null,
                        address,
                        type: 'web3',
                        id: '0',
                        role: 'authenticated',
                    },
                    error: null,
                }),
            );

            when(
                web3TokensServiceMock.check(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: {
                        timestamp: parseInt(timestamp),
                        address,
                    },
                    error: null,
                }),
            );

            when(
                web3TokensServiceMock.register(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: {
                        timestamp: parseInt(timestamp),
                        address,
                    },
                    error: null,
                }),
            );

            await expect(
                localStrategy.validate(timestamp, login_signature.hex),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.Unauthorized,
                    message: 'duplicate_token_usage',
                },
                status: StatusCodes.Unauthorized,
                message: {
                    status: StatusCodes.Unauthorized,
                    message: 'duplicate_token_usage',
                },
            });

            verify(
                authenticationServiceMock.validateWeb3User(
                    timestamp,
                    login_signature.hex,
                ),
            ).called();
            verify(
                web3TokensServiceMock.check(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).called();
            verify(
                web3TokensServiceMock.register(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).never();
        });

        it('token register unexpected error', async function() {
            const localStrategy: Web3Strategy = context.localStrategy;
            const authenticationServiceMock: AuthenticationService =
                context.authenticationServiceMock;
            const web3TokensServiceMock: Web3TokensService =
                context.web3TokensServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const login_payload = web3LoginSigner.generateAuthenticationProofPayload();
            const login_signature = await web3LoginSigner.sign(
                wallet.privateKey,
                login_payload[1],
            );
            const timestamp = login_payload[0].toString();

            when(
                authenticationServiceMock.validateWeb3User(
                    timestamp,
                    login_signature.hex,
                ),
            ).thenReturn(
                Promise.resolve({
                    response: {
                        username,
                        email,
                        wallet: null,
                        address,
                        type: 'web3',
                        id: '0',
                        role: 'authenticated',
                    },
                    error: null,
                }),
            );

            when(
                web3TokensServiceMock.check(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: null,
                }),
            );

            when(
                web3TokensServiceMock.register(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).thenReturn(
                Promise.resolve({
                    response: null,
                    error: 'unexpected_error',
                }),
            );

            await expect(
                localStrategy.validate(timestamp, login_signature.hex),
            ).rejects.toMatchObject({
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

            verify(
                authenticationServiceMock.validateWeb3User(
                    timestamp,
                    login_signature.hex,
                ),
            ).called();
            verify(
                web3TokensServiceMock.check(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).called();
            verify(
                web3TokensServiceMock.register(
                    deepEqual({ timestamp: parseInt(timestamp), address }),
                ),
            ).called();
        });
    });
});
