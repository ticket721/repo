import { use, expect }                             from 'chai';
import * as chaiAsPromised                         from 'chai-as-promised';
import { Test, TestingModule }                     from '@nestjs/testing';
import { AuthenticationController }                from './Authentication.controller';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { AuthenticationService }    from './Authentication.service';
import {
    createWallet,
    encryptWallet,
    keccak256, toAcceptedAddressFormat,
    toAcceptedKeccak256Format,
    Wallet,
}                                   from '@ticket721sources/global';
import { StatusCodes, StatusNames } from '../../utils/codes';
import { LocalRegisterInputDto }    from './dto/LocalRegisterInput.dto';
import { JwtModule }                from '@nestjs/jwt';
import { ConfigService }            from '../../config/Config.service';
import { ServiceResponse }          from '../../utils/ServiceResponse';
import { PasswordlessUserDto }      from './dto/PasswordlessUser.dto';
import { LocalLoginInputDto }       from './dto/LocalLoginInput.dto';

use(chaiAsPromised);

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
                    secret: 'secret'
                })
            ],
            providers: [
                AuthenticationServiceProvider,
                ConfigServiceProvider
            ],
            controllers: [
                AuthenticationController,
            ],
        }).compile();

        this.authenticationController = module.get<AuthenticationController>(AuthenticationController);
        this.authenticationServiceMock = authenticationServiceMock;
        this.configServiceMock = configServiceMock;

    });

    describe('localRegister', function () {

        it('should create a user', async function() {

            const authenticationController: AuthenticationController = this.authenticationController;
            const authenticationServiceMock: AuthenticationService = this.authenticationServiceMock;

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
                    role: 'authenticated'
                }, error: null,
            }));

            const user: LocalRegisterInputDto = {
                username: 'salut',
                password: hashedp,
                email: 'test@test.com',
                wallet: encrypted,
            };

            const res = await authenticationController.localRegister(user);
            expect(res.user).to.not.be.undefined;
            expect(res.token).to.not.be.undefined;
            expect(res.user).to.deep.equal({
                username,
                email,
                wallet: JSON.stringify(encrypted),
                type: 't721',
                address: toAcceptedAddressFormat(address),
                id: '0',
                role: 'authenticated'
            });
            expect(res.token).to.not.be.undefined;

            verify(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).called();

        });

        it('email already in use - should error with 409', async function() {

            const authenticationController: AuthenticationController = this.authenticationController;
            const authenticationServiceMock: AuthenticationService = this.authenticationServiceMock;


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

            await expect(authenticationController.localRegister(user)).to.eventually.be.rejectedWith({
                status: StatusCodes.Conflict,
                name: StatusNames[StatusCodes.Conflict],
                message: 'email_already_in_use',
            });

            verify(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).called();

        });

        it('username already in use - should error with 409', async function() {

            const authenticationController: AuthenticationController = this.authenticationController;
            const authenticationServiceMock: AuthenticationService = this.authenticationServiceMock;

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

            await expect(authenticationController.localRegister(user)).to.eventually.be.rejectedWith({
                status: StatusCodes.Conflict,
                name: StatusNames[StatusCodes.Conflict],
                message: 'username_already_in_use',
            });

            verify(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).called();

        });

        it('address already in use - should error with 409', async function() {

            const authenticationController: AuthenticationController = this.authenticationController;
            const authenticationServiceMock: AuthenticationService = this.authenticationServiceMock;

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

            await expect(authenticationController.localRegister(user)).to.eventually.be.rejectedWith({
                status: StatusCodes.Conflict,
                name: StatusNames[StatusCodes.Conflict],
                message: 'address_already_in_use',
            });

            verify(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).called();

        });

        it('invalid wallet format - should error with 422', async function() {

            const authenticationController: AuthenticationController = this.authenticationController;
            const authenticationServiceMock: AuthenticationService = this.authenticationServiceMock;

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

            await expect(authenticationController.localRegister(user)).to.eventually.be.rejectedWith({
                status: StatusCodes.UnprocessableEntity,
                name: StatusNames[StatusCodes.UnprocessableEntity],
                message: 'invalid_wallet_format',
            });

            verify(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).called();

        });

        it('invalid password format - should error with 422', async function() {

            const authenticationController: AuthenticationController = this.authenticationController;
            const authenticationServiceMock: AuthenticationService = this.authenticationServiceMock;

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

            await expect(authenticationController.localRegister(user)).to.eventually.be.rejectedWith({
                status: StatusCodes.UnprocessableEntity,
                name: StatusNames[StatusCodes.UnprocessableEntity],
                message: 'password_should_be_keccak256',
            });

            verify(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).called();

        });

        it('unknown error - should error with 422', async function() {

            const authenticationController: AuthenticationController = this.authenticationController;
            const authenticationServiceMock: AuthenticationService = this.authenticationServiceMock;

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

            await expect(authenticationController.localRegister(user)).to.eventually.be.rejectedWith({
                status: StatusCodes.InternalServerError,
                name: StatusNames[StatusCodes.InternalServerError],
                message: 'this_error_does_not_exist',
            });

            verify(authenticationServiceMock.createT721User(email, hashedp, username, deepEqual(encrypted))).called();

        });

    });

});
