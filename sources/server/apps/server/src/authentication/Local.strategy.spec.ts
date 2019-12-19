import { use, expect }                  from 'chai';
import * as chaiAsPromised              from 'chai-as-promised';
import * as chaiSubset                  from 'chai-subset';
import { Test, TestingModule }          from '@nestjs/testing';
import { instance, mock, verify, when } from 'ts-mockito';
import { AuthenticationService }        from './Authentication.service';
import {
    createWallet,
    encryptWallet,
    keccak256, toAcceptedAddressFormat,
    toAcceptedKeccak256Format,
    Wallet,
}                                       from '@ticket721sources/global';
import { LocalStrategy }                from './Local.strategy';
import { StatusCodes, StatusNames }     from '../utils/codes';

use(chaiAsPromised);
use(chaiSubset);

describe('Local Strategy', function() {

    beforeEach(async function() {

        const authenticationServiceMock: AuthenticationService = mock(AuthenticationService);

        const AuthenticationServiceProvider = {
            provide: AuthenticationService,
            useValue: instance(authenticationServiceMock),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthenticationServiceProvider,
                LocalStrategy,
            ],
        }).compile();

        this.localStrategy = module.get<LocalStrategy>(LocalStrategy);
        this.authenticationServiceMock = authenticationServiceMock;

    });

    describe('validate', function() {

        it('should validate user', async function() {

            const localStrategy: LocalStrategy = this.localStrategy;
            const authenticationServiceMock: AuthenticationService = this.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);
            const encrypted = JSON.parse(encrypted_string);

            when(authenticationServiceMock.validateUser(email, hashedp)).thenReturn(Promise.resolve({
                response: {
                    username,
                    email,
                    wallet: encrypted_string,
                    address: toAcceptedAddressFormat(address),
                    type: 't721',
                    id: '0',
                    role: 'authenticated',
                },
                error: null,
            }));

            const res = await localStrategy.validate(email, hashedp);

            expect(res).to.deep.equal({
                username,
                email,
                wallet: encrypted_string,
                address: toAcceptedAddressFormat(address),
                type: 't721',
                id: '0',
                role: 'authenticated',
            });

            verify(authenticationServiceMock.validateUser(email, hashedp)).called();

        });

        it('should throw unauthorized exception', async function() {

            const localStrategy: LocalStrategy = this.localStrategy;
            const authenticationServiceMock: AuthenticationService = this.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);
            const encrypted = JSON.parse(encrypted_string);

            when(authenticationServiceMock.validateUser(email, hashedp)).thenReturn(Promise.resolve({
                response: null,
                error: 'invalid_credentials',
            }));

            try {
                await localStrategy.validate(email, hashedp);
                expect(0).to.equal(1);
            } catch (e) {
                if (!e.status && !e.response && !e.message) {
                    throw e;
                }
                expect(e).to.containSubset({
                    status: StatusCodes.Unauthorized,
                    response: {
                        status: StatusCodes.Unauthorized,
                        message: 'invalid_credentials',
                    },
                    message: {
                        status: StatusCodes.Unauthorized,
                        message: 'invalid_credentials',
                    },
                });
            }

            verify(authenticationServiceMock.validateUser(email, hashedp)).called();

        });

        it('should throw internal error exception', async function() {

            const localStrategy: LocalStrategy = this.localStrategy;
            const authenticationServiceMock: AuthenticationService = this.authenticationServiceMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);
            const encrypted = JSON.parse(encrypted_string);

            when(authenticationServiceMock.validateUser(email, hashedp)).thenReturn(Promise.resolve({
                response: null,
                error: 'internal_error',
            }));

            try {
                await localStrategy.validate(email, hashedp);
                expect(0).to.equal(1);
            } catch (e) {
                if (!e.status && !e.response && !e.message) {
                    throw e;
                }
                expect(e).to.containSubset({
                    status: StatusCodes.InternalServerError,
                    response: {
                        status: StatusCodes.InternalServerError,
                        message: 'internal_error',
                    },
                    message: {
                        status: StatusCodes.InternalServerError,
                        message: 'internal_error',
                    },
                });
            }

            verify(authenticationServiceMock.validateUser(email, hashedp)).called();

        });

    });

});
