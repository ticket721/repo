import { use, expect }                                                    from 'chai';
import * as chaiAsPromised                                                from 'chai-as-promised';
import { Test, TestingModule }                                            from '@nestjs/testing';
import { anyFunction, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import {
    createWallet,
    encryptWallet,
    keccak256, toAcceptedAddressFormat,
    toAcceptedKeccak256Format,
    Wallet,
}                                      from '@ticket721sources/global';
import { UsersService }                from './Users.service';
import { UserEntity }                  from './entities/User.entity';
import { UsersRepository }             from './Users.repository';
import {
    EsSearchOptionsStatic,
}                                      from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';
import { ESSearchHit, ESSearchReturn } from '../../utils/ESSearchReturn';
import { CreateUserServiceInputDto }   from './dto/CreateUserServiceInput.dto';

use(chaiAsPromised);

class UserEntityModelMock {
    search(options: EsSearchOptionsStatic, callback?: (err: any, ret: any) => void): void {
        return;
    }
}

describe('Users Service', function() {

    beforeEach(async function() {

        const userEntityModelMock: UserEntityModelMock = mock(UserEntityModelMock);

        const usersRepositoryMock: UsersRepository = mock(UsersRepository);

        const UserModelProvider = {
            provide: 'UserEntityModel',
            useValue: instance(userEntityModelMock),
        };

        const UsersRepositoryProvider = {
            provide: UsersRepository,
            useValue: instance(usersRepositoryMock),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersRepositoryProvider,
                UserModelProvider,
                UsersService,
            ],
        }).compile();

        this.usersService = module.get<UsersService>(UsersService);
        this.userEntityModelMock = userEntityModelMock;
        this.usersRepositoryMock = usersRepositoryMock;

    });

    describe('findByAddress', function() {

        it('should return existing user', async function() {

            const usersService: UsersService = this.usersService;
            const userEntityModelMock: UserEntityModelMock = this.userEntityModelMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);

            const injected_cb = (options: any, cb: any): void => {
                cb(null, {
                        took: 2,
                        timed_out: false,
                        _shards: {
                            total: 2,
                            successful: 2,
                            skipped: 0,
                            failed: 0,
                        },
                        hits: {
                            total: 1,
                            max_score: 0.5,
                            hits: [
                                {
                                    _index: 'ticket721_user',
                                    _type: 'user',
                                    _id: '0',
                                    _score: 0.5,
                                    _source: {
                                        username,
                                        email,
                                        password: hashedp,
                                        wallet: encrypted_string,
                                        address: toAcceptedAddressFormat(address),
                                        id: '0',
                                        type: 't721',
                                        role: 'authenticated'
                                    },
                                } as ESSearchHit<UserEntity>,
                            ],
                        },
                    } as ESSearchReturn<UserEntity>,
                );
            };

            when(userEntityModelMock.search(
                deepEqual({
                    body: {
                        query: {
                            match: {
                                address,
                            },
                        },
                    },
                }),
                anyFunction(),
            )).thenCall(injected_cb);

            const res = await usersService.findByAddress(address);

            expect(res.error).to.equal(null);
            expect(res.response).to.deep.equal({
                username,
                email,
                address: toAcceptedAddressFormat(address),
                id: '0',
                type: 't721',
                password: hashedp,
                wallet: encrypted_string,
                role: 'authenticated'
            });

            verify(userEntityModelMock.search(
                deepEqual({
                    body: {
                        query: {
                            match: {
                                address,
                            },
                        },
                    },
                }),
                anyFunction(),
            )).called();

        });

        it('should return null on invalid address', async function() {

            const usersService: UsersService = this.usersService;
            const userEntityModelMock: UserEntityModelMock = this.userEntityModelMock;

            const wallet: Wallet = await createWallet();
            const address = wallet.address.slice(4);

            const res = await usersService.findByAddress(address);

            expect(res.error).to.equal('invalid_address_format');
            expect(res.response).to.equal(null);

            verify(userEntityModelMock.search(
                anything(),
                anyFunction(),
            )).never();

        });

        it('unexpected search error', async function() {

            const usersService: UsersService = this.usersService;
            const userEntityModelMock: UserEntityModelMock = this.userEntityModelMock;

            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);

            const injected_cb = (options: any, cb: any): void => {
                cb({ error: 'exists' }, null);
            };

            when(userEntityModelMock.search(
                deepEqual({
                    body: {
                        query: {
                            match: {
                                address,
                            },
                        },
                    },
                }),
                anyFunction(),
            )).thenCall(injected_cb);

            const res = await usersService.findByAddress(address);

            expect(res.error).to.equal('unexpected_error');
            expect(res.response).to.equal(null);

            verify(userEntityModelMock.search(
                deepEqual({
                    body: {
                        query: {
                            match: {
                                address,
                            },
                        },
                    },
                }),
                anyFunction(),
            )).called();

        });

        it('search with no hits', async function() {

            const usersService: UsersService = this.usersService;
            const userEntityModelMock: UserEntityModelMock = this.userEntityModelMock;

            const wallet: Wallet = await createWallet();
            const address = wallet.address;

            const injected_cb = (options: any, cb: any): void => {
                cb(null, {
                        took: 2,
                        timed_out: false,
                        _shards: {
                            total: 2,
                            successful: 2,
                            skipped: 0,
                            failed: 0,
                        },
                        hits: {
                            total: 0,
                            max_score: 0,
                            hits: [],
                        },
                    } as ESSearchReturn<UserEntity>,
                );
            };

            when(userEntityModelMock.search(
                deepEqual({
                    body: {
                        query: {
                            match: {
                                address,
                            },
                        },
                    },
                }),
                anyFunction(),
            )).thenCall(injected_cb);

            const res = await usersService.findByAddress(address);

            expect(res.error).to.equal(null);
            expect(res.response).to.equal(null);

            verify(userEntityModelMock.search(
                deepEqual({
                    body: {
                        query: {
                            match: {
                                address,
                            },
                        },
                    },
                }),
                anyFunction(),
            )).called();

        });

    });

    describe('findByUsername', function() {

        it('should return existing user', async function() {

            const usersService: UsersService = this.usersService;
            const userEntityModelMock: UserEntityModelMock = this.userEntityModelMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);

            const injected_cb = (options: any, cb: any): void => {
                cb(null, {
                        took: 2,
                        timed_out: false,
                        _shards: {
                            total: 2,
                            successful: 2,
                            skipped: 0,
                            failed: 0,
                        },
                        hits: {
                            total: 1,
                            max_score: 0.5,
                            hits: [
                                {
                                    _index: 'ticket721_user',
                                    _type: 'user',
                                    _id: '0',
                                    _score: 0.5,
                                    _source: {
                                        username,
                                        email,
                                        password: hashedp,
                                        wallet: encrypted_string,
                                        address: toAcceptedAddressFormat(address),
                                        id: '0',
                                        type: 't721',
                                        role: 'authenticated'
                                    },
                                } as ESSearchHit<UserEntity>,
                            ],
                        },
                    } as ESSearchReturn<UserEntity>,
                );
            };

            when(userEntityModelMock.search(
                deepEqual({
                    body: {
                        query: {
                            match: {
                                username,
                            },
                        },
                    },
                }),
                anyFunction(),
            )).thenCall(injected_cb);

            const res = await usersService.findByUsername(username);

            expect(res.error).to.equal(null);
            expect(res.response).to.deep.equal({
                username,
                email,
                address: toAcceptedAddressFormat(address),
                id: '0',
                type: 't721',
                password: hashedp,
                wallet: encrypted_string,
                role: 'authenticated'
            });

            verify(userEntityModelMock.search(
                deepEqual({
                    body: {
                        query: {
                            match: {
                                username,
                            },
                        },
                    },
                }),
                anyFunction(),
            )).called();

        });

        it('unexpected search error', async function() {

            const usersService: UsersService = this.usersService;
            const userEntityModelMock: UserEntityModelMock = this.userEntityModelMock;

            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);

            const injected_cb = (options: any, cb: any): void => {
                cb({ error: 'exists' }, null);
            };

            when(userEntityModelMock.search(
                deepEqual({
                    body: {
                        query: {
                            match: {
                                username,
                            },
                        },
                    },
                }),
                anyFunction(),
            )).thenCall(injected_cb);

            const res = await usersService.findByUsername(username);

            expect(res.error).to.equal('unexpected_error');
            expect(res.response).to.equal(null);

            verify(userEntityModelMock.search(
                deepEqual({
                    body: {
                        query: {
                            match: {
                                username,
                            },
                        },
                    },
                }),
                anyFunction(),
            )).called();

        });

        it('search with no hits', async function() {

            const usersService: UsersService = this.usersService;
            const userEntityModelMock: UserEntityModelMock = this.userEntityModelMock;

            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);

            const injected_cb = (options: any, cb: any): void => {
                cb(null, {
                        took: 2,
                        timed_out: false,
                        _shards: {
                            total: 2,
                            successful: 2,
                            skipped: 0,
                            failed: 0,
                        },
                        hits: {
                            total: 0,
                            max_score: 0,
                            hits: [],
                        },
                    } as ESSearchReturn<UserEntity>,
                );
            };

            when(userEntityModelMock.search(
                deepEqual({
                    body: {
                        query: {
                            match: {
                                username,
                            },
                        },
                    },
                }),
                anyFunction(),
            )).thenCall(injected_cb);

            const res = await usersService.findByUsername(username);

            expect(res.error).to.equal(null);
            expect(res.response).to.equal(null);

            verify(userEntityModelMock.search(
                deepEqual({
                    body: {
                        query: {
                            match: {
                                username,
                            },
                        },
                    },
                }),
                anyFunction(),
            )).called();

        });

    });

    describe('findByEmail', function() {

        it('should return existing user', async function() {

            const usersService: UsersService = this.usersService;
            const userEntityModelMock: UserEntityModelMock = this.userEntityModelMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);

            const injected_cb = (options: any, cb: any): void => {
                cb(null, {
                        took: 2,
                        timed_out: false,
                        _shards: {
                            total: 2,
                            successful: 2,
                            skipped: 0,
                            failed: 0,
                        },
                        hits: {
                            total: 1,
                            max_score: 0.5,
                            hits: [
                                {
                                    _index: 'ticket721_user',
                                    _type: 'user',
                                    _id: '0',
                                    _score: 0.5,
                                    _source: {
                                        username,
                                        email,
                                        password: hashedp,
                                        wallet: encrypted_string,
                                        address: toAcceptedAddressFormat(address),
                                        id: '0',
                                        type: 't721',
                                        role: 'authenticated'
                                    },
                                } as ESSearchHit<UserEntity>,
                            ],
                        },
                    } as ESSearchReturn<UserEntity>,
                );
            };

            when(userEntityModelMock.search(
                deepEqual({
                    body: {
                        query: {
                            match: {
                                email,
                            },
                        },
                    },
                }),
                anyFunction(),
            )).thenCall(injected_cb);

            const res = await usersService.findByEmail(email);

            expect(res.error).to.equal(null);
            expect(res.response).to.deep.equal({
                username,
                email,
                address: toAcceptedAddressFormat(address),
                id: '0',
                type: 't721',
                password: hashedp,
                wallet: encrypted_string,
                role: 'authenticated'
            });

            verify(userEntityModelMock.search(
                deepEqual({
                    body: {
                        query: {
                            match: {
                                email,
                            },
                        },
                    },
                }),
                anyFunction(),
            )).called();

        });

        it('unexpected search error', async function() {

            const usersService: UsersService = this.usersService;
            const userEntityModelMock: UserEntityModelMock = this.userEntityModelMock;

            const email = 'test@test.com';
            const wallet: Wallet = await createWallet();
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));

            const injected_cb = (options: any, cb: any): void => {
                cb({ error: 'exists' }, null);
            };

            when(userEntityModelMock.search(
                deepEqual({
                    body: {
                        query: {
                            match: {
                                email,
                            },
                        },
                    },
                }),
                anyFunction(),
            )).thenCall(injected_cb);

            const res = await usersService.findByEmail(email);

            expect(res.error).to.equal('unexpected_error');
            expect(res.response).to.equal(null);

            verify(userEntityModelMock.search(
                deepEqual({
                    body: {
                        query: {
                            match: {
                                email,
                            },
                        },
                    },
                }),
                anyFunction(),
            )).called();

        });

        it('search with no hits', async function() {

            const usersService: UsersService = this.usersService;
            const userEntityModelMock: UserEntityModelMock = this.userEntityModelMock;

            const email = 'test@test.com';

            const injected_cb = (options: any, cb: any): void => {
                cb(null, {
                        took: 2,
                        timed_out: false,
                        _shards: {
                            total: 2,
                            successful: 2,
                            skipped: 0,
                            failed: 0,
                        },
                        hits: {
                            total: 0,
                            max_score: 0,
                            hits: [],
                        },
                    } as ESSearchReturn<UserEntity>,
                );
            };

            when(userEntityModelMock.search(
                deepEqual({
                    body: {
                        query: {
                            match: {
                                email,
                            },
                        },
                    },
                }),
                anyFunction(),
            )).thenCall(injected_cb);

            const res = await usersService.findByEmail(email);

            expect(res.error).to.equal(null);
            expect(res.response).to.equal(null);

            verify(userEntityModelMock.search(
                deepEqual({
                    body: {
                        query: {
                            match: {
                                email,
                            },
                        },
                    },
                }),
                anyFunction(),
            )).called();

        });

    });

    describe('create', function() {

        it('should create user', async function() {

            const usersService: UsersService = this.usersService;
            const usersRepositoryMock: UsersRepository = this.usersRepositoryMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);

            const create_args = {
                username,
                email,
                password: hashedp,
                address: toAcceptedAddressFormat(address),
                wallet: encrypted_string,
                type: 't721'
            } as Partial<UserEntity>;

            const entity = {
                ...create_args,
                id: '0',
            } as UserEntity;

            const generated_cb = async (): Promise<UserEntity> => {
                return entity;
            };

            const injected_cb = (): any => {
                return {
                    toPromise: generated_cb
                }
            };

            when(usersRepositoryMock.create(deepEqual(create_args))).thenReturn(entity);
            when(usersRepositoryMock.save(deepEqual(entity))).thenCall(injected_cb);

            const res = await usersService.create(create_args as CreateUserServiceInputDto);

            verify(usersRepositoryMock.create(deepEqual(create_args))).called();
            verify(usersRepositoryMock.save(deepEqual(entity))).called();

            expect(res.error).to.equal(null);
            expect(res.response).to.deep.equal(entity);

        });

        it('should return unexpected error', async function() {

            const usersService: UsersService = this.usersService;
            const usersRepositoryMock: UsersRepository = this.usersRepositoryMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);

            const create_args = {
                username,
                email,
                password: hashedp,
                address: toAcceptedAddressFormat(address),
                wallet: encrypted_string,
                type: 't721',
                role: 'authenticated'
            } as Partial<UserEntity>;

            const entity = {
                ...create_args,
                id: '0',
            } as UserEntity;

            const injected_cb = (): any => {
                throw new Error('Unexpected internal error')
            };

            when(usersRepositoryMock.create(deepEqual(create_args))).thenReturn(entity);
            when(usersRepositoryMock.save(deepEqual(entity))).thenCall(injected_cb);

            const res = await usersService.create(create_args as CreateUserServiceInputDto);

            verify(usersRepositoryMock.create(deepEqual(create_args))).called();
            verify(usersRepositoryMock.save(deepEqual(entity))).called();

            expect(res.error).to.equal('unexpected_error');
            expect(res.response).to.equal(null);

        });

    });

});
