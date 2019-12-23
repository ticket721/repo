import { use, expect }                                        from 'chai';
import * as chaiAsPromised                                    from 'chai-as-promised';
import { Test, TestingModule }                                from '@nestjs/testing';
import { anyString, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { AuthenticationService } from './Authentication.service';
import {
    createWallet,
    encryptWallet,
    keccak256, toAcceptedAddressFormat,
    toAcceptedKeccak256Format,
    Wallet,
    Web3RegisterSigner,
    Web3LoginSigner
}                            from '@ticket721sources/global';
import { hash }              from 'bcrypt';
import { ServiceResponse }   from '../utils/ServiceResponse';
import { UsersService }      from '@lib/common/users/Users.service';
import { ConfigService }     from '@lib/common/config/Config.service';
import { UserDto }           from '@lib/common/users/dto/User.dto';
import { Web3TokensService } from '@app/server/web3token/Web3Tokens.service';

use(chaiAsPromised);

describe('Authentication Service', function() {

    beforeEach(async function() {

        const usersServiceMock: UsersService = mock(UsersService);
        const configServiceMock: ConfigService = mock(ConfigService);

        const UsersServiceProvider = {
            provide: UsersService,
            useValue: instance(usersServiceMock),
        };

        const ConfigServiceProvider = {
            provide: ConfigService,
            useValue: instance(configServiceMock),
        };

        when(configServiceMock.get('AUTH_SIGNATURE_TIMEOUT')).thenReturn('30');

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersServiceProvider,
                ConfigServiceProvider,
                AuthenticationService
            ],
        }).compile();

        this.authenticationService = module.get<AuthenticationService>(AuthenticationService);
        this.usersServiceMock = usersServiceMock;
        this.configServiceMock = configServiceMock;

    });

    describe('validateWeb3User', function () {

        it('should validate a web3 user', async function () {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;

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
                    wallet: null,
                    address,
                    type: 'web3',
                    password: null,
                    id: '0',
                    role: 'authenticated'
                },
                error: null,
            };

            when(usersServiceMock.findByAddress(address)).thenReturn(Promise.resolve(serviceResponse));

            const res = await authenticationService.validateWeb3User(loginPayload[0].toString(), loginSignature.hex);

            expect(res.response).to.not.be.undefined;
            expect(res.error).to.equal(null);
            expect(res.response).to.deep.equal({
                email,
                username,
                wallet: null,
                address,
                type: 'web3',
                id: '0',
                role: 'authenticated'
            });

            verify(usersServiceMock.findByAddress(address)).called();

        });

        it('user does not exist', async function () {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;

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

            expect(res.response).to.equal(null);
            expect(res.error).to.equal('invalid_signature');

            verify(usersServiceMock.findByAddress(address)).called();

        });

        it('signature of the past', async function () {

            const authenticationService: AuthenticationService = this.authenticationService;

            const wallet: Wallet = await createWallet();

            const past = Date.now() - 1000000;
            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const loginPayload = web3LoginSigner.generatePayload({
                timestamp: past
            }, 'Web3Login');
            const loginSignature = await web3LoginSigner.sign(wallet.privateKey, loginPayload);

            const res = await authenticationService.validateWeb3User(past.toString(), loginSignature.hex);

            expect(res.response).to.equal(null);
            expect(res.error).to.equal('signature_timed_out');

        });

        it('signature of the future', async function () {

            const authenticationService: AuthenticationService = this.authenticationService;

            const wallet: Wallet = await createWallet();

            const future = Date.now() + 1000000;
            const web3LoginSigner: Web3LoginSigner = new Web3LoginSigner(1);
            const loginPayload = web3LoginSigner.generatePayload({
                timestamp: future
            }, 'Web3Login');
            const loginSignature = await web3LoginSigner.sign(wallet.privateKey, loginPayload);

            const res = await authenticationService.validateWeb3User(future.toString(), loginSignature.hex);

            expect(res.response).to.equal(null);
            expect(res.error).to.equal('signature_is_in_the_future');

        });

    });

    describe('createWeb3User', function() {

        it('should create a user', async function() {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;

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
                    wallet: null,
                    address,
                    type: 'web3',
                    password: null,
                    id: '0',
                    role: 'authenticated'
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.create(deepEqual({
                email,
                username,
                wallet: null,
                address,
                type: 'web3',
                password: null,
                role: 'authenticated'
            }))).thenReturn(Promise.resolve(serviceResponse));

            when(usersServiceMock.findByAddress(address)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);

            const res = await authenticationService.createWeb3User(email, username, registerPayload[0].toString(), address, registerSignature.hex);

            expect(res.response).to.not.be.undefined;
            expect(res.error).to.equal(null);
            expect(res.response).to.deep.equal({
                email,
                username,
                wallet: null,
                address,
                type: 'web3',
                id: '0',
                role: 'authenticated'
            });

            verify(usersServiceMock.create(deepEqual({
                email,
                username,
                wallet: null,
                address,
                type: 'web3',
                password: null,
                role: 'authenticated'
            }))).called();

            verify(usersServiceMock.findByAddress(address)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();

        });

        it('email already in use', async function() {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;
            const web3TokensServiceMock: Web3TokensService = this.web3TokensServiceMock;

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
                    wallet: null,
                    address,
                    password: null,
                    type: 'web3',
                    id: '0',
                    role: 'authenticated'
                },
                error: null,
            };

            when(usersServiceMock.findByEmail(email)).thenReturn(Promise.resolve(serviceResponse));

            const res = await authenticationService.createWeb3User(email, username, registerPayload[0].toString(), address, registerSignature.hex);

            expect(res.response).to.equal(null);
            expect(res.error).to.equal('email_already_in_use');

            verify(usersServiceMock.findByEmail(email)).called();

        });

        it('username already in use', async function() {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;
            const web3TokensServiceMock: Web3TokensService = this.web3TokensServiceMock;

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
                    wallet: null,
                    address,
                    password: null,
                    type: 'web3',
                    id: '0',
                    role: 'authenticated'
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByUsername(username)).thenReturn(Promise.resolve(serviceResponse));
            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);

            const res = await authenticationService.createWeb3User(email, username, registerPayload[0].toString(), address, registerSignature.hex);

            expect(res.response).to.equal(null);
            expect(res.error).to.equal('username_already_in_use');

            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();

        });

        it('address already in use', async function() {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;
            const web3TokensServiceMock: Web3TokensService = this.web3TokensServiceMock;

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
                    wallet: null,
                    address,
                    password: null,
                    type: 'web3',
                    id: '0',
                    role: 'authenticated'
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

            const res = await authenticationService.createWeb3User(email, username, registerPayload[0].toString(), address, registerSignature.hex);

            expect(res.response).to.equal(null);
            expect(res.error).to.equal('address_already_in_use');

            verify(usersServiceMock.findByAddress(address)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();

        });

        it('invalid signature', async function() {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;
            const web3TokensServiceMock: Web3TokensService = this.web3TokensServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const other_wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(other_wallet.address);

            const web3RegisterSigner: Web3RegisterSigner = new Web3RegisterSigner(1);
            const registerPayload = web3RegisterSigner.generateRegistrationProofPayload(email, username);
            const registerSignature = await web3RegisterSigner.sign(wallet.privateKey, registerPayload[1]);

            const serviceResponse: ServiceResponse<UserDto> = {
                response: {
                    email,
                    username,
                    wallet: null,
                    address,
                    type: 'web3',
                    password: null,
                    id: '0',
                    role: 'authenticated'
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByAddress(address)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);

            const res = await authenticationService.createWeb3User(email, username, registerPayload[0].toString(), address, registerSignature.hex);

            expect(res.response).to.equal(null);
            expect(res.error).to.equal('invalid_signature');

            verify(usersServiceMock.findByAddress(address)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();

        });

    });

    describe('createT721User', function() {

        it('should create a user', async function() {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;

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
                    address: toAcceptedAddressFormat(address),
                    type: 't721',
                    password: hashedp,
                    id: '0',
                    role: 'authenticated'
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.create(deepEqual({
                email,
                username,
                wallet: encrypted_string,
                address: toAcceptedAddressFormat(address),
                type: 't721',
                password: anyString(),
                role: 'authenticated'
            }))).thenReturn(Promise.resolve(serviceResponse));

            when(usersServiceMock.findByAddress(address)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);

            const res = await authenticationService.createT721User(email, hashedp, username, encrypted);

            expect(res.response).to.not.be.undefined;
            expect(res.error).to.equal(null);
            expect(res.response).to.deep.equal({
                email,
                username,
                wallet: encrypted_string,
                address: toAcceptedAddressFormat(address),
                type: 't721',
                id: '0',
                role: 'authenticated'
            });

            verify(usersServiceMock.create(deepEqual({
                email,
                username,
                wallet: encrypted_string,
                address: toAcceptedAddressFormat(address),
                type: 't721',
                password: anyString(),
                role: 'authenticated'
            }))).called();

            verify(usersServiceMock.findByAddress(address)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();

        });

        it('email already in use', async function() {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;

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
                    role: 'authenticated'
                },
                error: null,
            };

            when(usersServiceMock.findByEmail(email)).thenReturn(Promise.resolve(serviceResponse));

            const res = await authenticationService.createT721User(email, hashedp, username, JSON.parse(encrypted));

            expect(res.response).to.equal(null);
            expect(res.error).to.equal('email_already_in_use');
            verify(usersServiceMock.findByEmail(email)).called();

        });

        it('username already in use', async function() {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;

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
                    role: 'authenticated'
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(Promise.resolve(serviceResponse));

            const res = await authenticationService.createT721User(email, hashedp, username, JSON.parse(encrypted));

            expect(res.response).to.equal(null);
            expect(res.error).to.equal('username_already_in_use');
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByEmail(email)).called();

        });

        it('invalid wallet format', async function() {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted = await encryptWallet(wallet, hashedp);

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);

            const parsed_encrypted = JSON.parse(encrypted);
            parsed_encrypted.version = 2;

            const res = await authenticationService.createT721User(email, hashedp, username, parsed_encrypted);

            expect(res.response).to.equal(null);
            expect(res.error).to.equal('invalid_wallet_format');
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByEmail(email)).called();

        });

        it('address already in use', async function() {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;

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
                    address: toAcceptedAddressFormat(address),
                    type: 't721',
                    password: hashedp,
                    id: '0',
                    role: 'authenticated'
                },
                error: null,
            };

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByAddress(address)).thenReturn(Promise.resolve(serviceResponse));

            const res = await authenticationService.createT721User(email, hashedp, username, JSON.parse(encrypted));

            expect(res.response).to.equal(null);
            expect(res.error).to.equal('address_already_in_use');
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByAddress(address)).called();

        });

        it('invalid password', async function() {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted = await encryptWallet(wallet, hashedp);

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByAddress(address)).thenReturn(emptyServiceResponse);

            const res = await authenticationService.createT721User(email, hashedp.slice(4), username, JSON.parse(encrypted));

            expect(res.response).to.equal(null);
            expect(res.error).to.equal('password_should_be_keccak256');
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByAddress(address)).called();

        });

        it('email query internal error', async function() {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted = await encryptWallet(wallet, hashedp);

            when(usersServiceMock.findByEmail(email)).thenReturn(Promise.resolve({
                response: null,
                error: 'unexpected_error',
            }));

            const res = await authenticationService.createT721User(email, hashedp.slice(4), username, JSON.parse(encrypted));

            expect(res.response).to.equal(null);
            expect(res.error).to.equal('unexpected_error');
            verify(usersServiceMock.findByEmail(email)).called();

        });

        it('username query internal error', async function() {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted = await encryptWallet(wallet, hashedp);

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(Promise.resolve({
                response: null,
                error: 'unexpected_error',
            }));

            const res = await authenticationService.createT721User(email, hashedp.slice(4), username, JSON.parse(encrypted));

            expect(res.response).to.equal(null);
            expect(res.error).to.equal('unexpected_error');
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();

        });

        it('address query internal error', async function() {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = toAcceptedAddressFormat(wallet.address);
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted = await encryptWallet(wallet, hashedp);

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByAddress(address)).thenReturn(Promise.resolve({
                response: null,
                error: 'unexpected_error',
            }));

            const res = await authenticationService.createT721User(email, hashedp.slice(4), username, JSON.parse(encrypted));

            expect(res.response).to.equal(null);
            expect(res.error).to.equal('unexpected_error');
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByAddress(address)).called();

        });

        it('create user internal error', async function() {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);
            const encrypted = JSON.parse(encrypted_string);

            const emptyServiceResponse: Promise<ServiceResponse<UserDto>> = Promise.resolve({
                response: null,
                error: null,
            });

            when(usersServiceMock.create(deepEqual({
                email,
                username,
                wallet: encrypted_string,
                address: toAcceptedAddressFormat(address),
                type: 't721',
                password: anyString(),
                role: 'authenticated'
            }))).thenReturn(Promise.resolve({
                response: null,
                error: 'unexpected_error',
            }));

            when(usersServiceMock.findByAddress(address)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByEmail(email)).thenReturn(emptyServiceResponse);
            when(usersServiceMock.findByUsername(username)).thenReturn(emptyServiceResponse);

            const res = await authenticationService.createT721User(email, hashedp, username, encrypted);

            expect(res.response).to.equal(null);
            expect(res.error).to.equal('unexpected_error');
            verify(usersServiceMock.findByEmail(email)).called();
            verify(usersServiceMock.findByUsername(username)).called();
            verify(usersServiceMock.findByAddress(address)).called();
            verify(usersServiceMock.create(deepEqual({
                email,
                username,
                wallet: encrypted_string,
                address: toAcceptedAddressFormat(address),
                type: 't721',
                password: anyString(),
                role: 'authenticated'
            }))).called();

        });

    });

    describe('validateUser', function() {

        it('checks valid user', async function() {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;

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
                    role: 'authenticated'
                },
                error: null,
            };

            when(usersServiceMock.findByEmail(email)).thenReturn(Promise.resolve(serviceResponse));

            const res = await authenticationService.validateUser(email, hashedp);

            expect(res.response).to.deep.equal({
                username,
                email,
                wallet: encrypted_string,
                address: toAcceptedAddressFormat(address),
                type: 't721',
                id: '0',
                role: 'authenticated'
            });
            verify(usersServiceMock.findByEmail(email)).called();

        });

        it('check errors', async function() {

            const authenticationService: AuthenticationService = this.authenticationService;
            const usersServiceMock: UsersService = this.usersServiceMock;

            const email = 'test@test.com';
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));

            const serviceResponse: ServiceResponse<UserDto> = {
                response: null,
                error: 'unexpected_error',
            };

            when(usersServiceMock.findByEmail(email)).thenReturn(Promise.resolve(serviceResponse));

            const res = await authenticationService.validateUser(email, hashedp);

            expect(res.response).to.equal(null);
            expect(res.error).to.equal('unexpected_error');
            verify(usersServiceMock.findByEmail(email)).called();

        });

    });

});
