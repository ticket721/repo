import { use, expect }                                        from 'chai';
import * as chaiAsPromised                                    from 'chai-as-promised';
import { Test, TestingModule }                                from '@nestjs/testing';
import { anyString, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { AuthenticationService }                              from './Authentication.service';
import {
    createWallet,
    encryptWallet,
    keccak256, toAcceptedAddressFormat,
    toAcceptedKeccak256Format,
    Wallet,
}                                                             from '@ticket721sources/global';
import { UsersService }                                       from '../users/Users.service';
import { UserDto }                                            from '../users/dto/User.dto';
import { ServiceResponse }                                    from '../../utils/ServiceResponse';
import { ConfigService }                                      from '../../config/Config.service';
import { hash }                                               from 'bcrypt';

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

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersServiceProvider,
                ConfigServiceProvider,
                AuthenticationService,
            ],
        }).compile();

        this.authenticationService = module.get<AuthenticationService>(AuthenticationService);
        this.usersServiceMock = usersServiceMock;
        this.configServiceMock = configServiceMock;

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
            const encrypted = JSON.parse(encrypted_string);

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
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);
            const encrypted = JSON.parse(encrypted_string);

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
