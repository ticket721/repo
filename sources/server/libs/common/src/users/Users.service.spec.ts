import { Test, TestingModule } from '@nestjs/testing';
import {
    anyFunction,
    anything,
    deepEqual,
    instance,
    mock,
    verify,
    when,
} from 'ts-mockito';
import {
    createWallet,
    encryptWallet,
    keccak256,
    toAcceptedAddressFormat,
    toAcceptedKeccak256Format,
    Wallet,
} from '@ticket721sources/global';
import { UsersService } from './Users.service';
import { UserEntity } from './entities/User.entity';
import { UsersRepository } from './Users.repository';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';
import { CreateUserServiceInputDto } from './dto/CreateUserServiceInput.dto';
import { uuid } from '@iaminfinity/express-cassandra';
import { ESSearchHit, ESSearchReturn } from '@lib/common/utils/ESSearchReturn';

class UserEntityModelMock {
    search(
        options: EsSearchOptionsStatic,
        callback?: (err: any, ret: any) => void,
    ): void {
        return;
    }
}

const context: {
    usersService: UsersService;
    userEntityModelMock: UserEntityModelMock;
    usersRepositoryMock: UsersRepository;
} = {
    usersService: null,
    userEntityModelMock: null,
    usersRepositoryMock: null,
};

describe('Users Service', function() {
    beforeEach(async function() {
        const userEntityModelMock: UserEntityModelMock = mock(
            UserEntityModelMock,
        );

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

        context.usersService = module.get<UsersService>(UsersService);
        context.userEntityModelMock = userEntityModelMock;
        context.usersRepositoryMock = usersRepositoryMock;
    });

    describe('findById', function() {
        test('should return existing user', async function() {
            const usersService: UsersService = context.usersService;
            const userEntityModelMock: UserEntityModelMock =
                context.userEntityModelMock;
            const usersRepositoryMock: UsersRepository =
                context.usersRepositoryMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);
            const id = '00000000-0000-0000-0000-000000000000';

            const generated_cb = async (): Promise<UserEntity> => {
                return {
                    username,
                    email,
                    wallet: encrypted_string,
                    address,
                    password: hashedp,
                    id,
                    type: 't721',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                };
            };

            const injected_cb = (): any => {
                return {
                    toPromise: generated_cb,
                };
            };

            when(
                usersRepositoryMock.findOne(deepEqual({ id: uuid(id) as any })),
            ).thenCall(injected_cb);

            const res = await usersService.findById(id);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                username,
                email,
                wallet: encrypted_string,
                address,
                password: hashedp,
                id,
                type: 't721',
                role: 'authenticated',
                locale: 'en',
                valid: false,
            });
        });

        test('should return null on undefined query result', async function() {
            const usersService: UsersService = context.usersService;
            const userEntityModelMock: UserEntityModelMock =
                context.userEntityModelMock;
            const usersRepositoryMock: UsersRepository =
                context.usersRepositoryMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);
            const id = '00000000-0000-0000-0000-000000000000';

            const generated_cb = async (): Promise<UserEntity> => {
                return undefined;
            };

            const injected_cb = (): any => {
                return {
                    toPromise: generated_cb,
                };
            };

            when(
                usersRepositoryMock.findOne(deepEqual({ id: uuid(id) as any })),
            ).thenCall(injected_cb);

            const res = await usersService.findById(id);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(null);
        });

        test('unexpected search error', async function() {
            const usersService: UsersService = context.usersService;
            const userEntityModelMock: UserEntityModelMock =
                context.userEntityModelMock;
            const usersRepositoryMock: UsersRepository =
                context.usersRepositoryMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);
            const id = '00000000-0000-0000-0000-000000000000';

            const generated_cb = async (): Promise<UserEntity> => {
                return {
                    username,
                    email,
                    wallet: encrypted_string,
                    address,
                    password: hashedp,
                    id,
                    type: 't721',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                };
            };

            const injected_cb = (): any => {
                return {
                    toUnPromise: generated_cb,
                };
            };

            when(
                usersRepositoryMock.findOne(deepEqual({ id: uuid(id) as any })),
            ).thenCall(injected_cb);

            const res = await usersService.findById(id);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);
        });
    });

    describe('findByAddress', function() {
        test('should return existing user', async function() {
            const usersService: UsersService = context.usersService;
            const userEntityModelMock: UserEntityModelMock =
                context.userEntityModelMock;

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
                                    role: 'authenticated',
                                },
                            } as ESSearchHit<UserEntity>,
                        ],
                    },
                } as ESSearchReturn<UserEntity>);
            };

            when(
                userEntityModelMock.search(
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
                ),
            ).thenCall(injected_cb);

            const res = await usersService.findByAddress(address);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                username,
                email,
                address: toAcceptedAddressFormat(address),
                id: '0',
                type: 't721',
                password: hashedp,
                wallet: encrypted_string,
                role: 'authenticated',
            });

            verify(
                userEntityModelMock.search(
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
                ),
            ).called();
        });

        test('should return null on invalid address', async function() {
            const usersService: UsersService = context.usersService;
            const userEntityModelMock: UserEntityModelMock =
                context.userEntityModelMock;

            const wallet: Wallet = await createWallet();
            const address = wallet.address.slice(4);

            const res = await usersService.findByAddress(address);

            expect(res.error).toEqual('invalid_address_format');
            expect(res.response).toEqual(null);

            verify(
                userEntityModelMock.search(anything(), anyFunction()),
            ).never();
        });

        test('unexpected search error', async function() {
            const usersService: UsersService = context.usersService;
            const userEntityModelMock: UserEntityModelMock =
                context.userEntityModelMock;

            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);

            const injected_cb = (options: any, cb: any): void => {
                cb({ error: 'exists' }, null);
            };

            when(
                userEntityModelMock.search(
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
                ),
            ).thenCall(injected_cb);

            const res = await usersService.findByAddress(address);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                userEntityModelMock.search(
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
                ),
            ).called();
        });

        test('search with no hits', async function() {
            const usersService: UsersService = context.usersService;
            const userEntityModelMock: UserEntityModelMock =
                context.userEntityModelMock;

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
                } as ESSearchReturn<UserEntity>);
            };

            when(
                userEntityModelMock.search(
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
                ),
            ).thenCall(injected_cb);

            const res = await usersService.findByAddress(address);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(null);

            verify(
                userEntityModelMock.search(
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
                ),
            ).called();
        });
    });

    describe('findByUsername', function() {
        test('should return existing user', async function() {
            const usersService: UsersService = context.usersService;
            const userEntityModelMock: UserEntityModelMock =
                context.userEntityModelMock;

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
                                    role: 'authenticated',
                                },
                            } as ESSearchHit<UserEntity>,
                        ],
                    },
                } as ESSearchReturn<UserEntity>);
            };

            when(
                userEntityModelMock.search(
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
                ),
            ).thenCall(injected_cb);

            const res = await usersService.findByUsername(username);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                username,
                email,
                address: toAcceptedAddressFormat(address),
                id: '0',
                type: 't721',
                password: hashedp,
                wallet: encrypted_string,
                role: 'authenticated',
            });

            verify(
                userEntityModelMock.search(
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
                ),
            ).called();
        });

        test('unexpected search error', async function() {
            const usersService: UsersService = context.usersService;
            const userEntityModelMock: UserEntityModelMock =
                context.userEntityModelMock;

            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);

            const injected_cb = (options: any, cb: any): void => {
                cb({ error: 'exists' }, null);
            };

            when(
                userEntityModelMock.search(
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
                ),
            ).thenCall(injected_cb);

            const res = await usersService.findByUsername(username);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                userEntityModelMock.search(
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
                ),
            ).called();
        });

        test('search with no hits', async function() {
            const usersService: UsersService = context.usersService;
            const userEntityModelMock: UserEntityModelMock =
                context.userEntityModelMock;

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
                } as ESSearchReturn<UserEntity>);
            };

            when(
                userEntityModelMock.search(
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
                ),
            ).thenCall(injected_cb);

            const res = await usersService.findByUsername(username);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(null);

            verify(
                userEntityModelMock.search(
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
                ),
            ).called();
        });
    });

    describe('findByEmail', function() {
        test('should return existing user', async function() {
            const usersService: UsersService = context.usersService;
            const userEntityModelMock: UserEntityModelMock =
                context.userEntityModelMock;

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
                                    role: 'authenticated',
                                },
                            } as ESSearchHit<UserEntity>,
                        ],
                    },
                } as ESSearchReturn<UserEntity>);
            };

            when(
                userEntityModelMock.search(
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
                ),
            ).thenCall(injected_cb);

            const res = await usersService.findByEmail(email);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                username,
                email,
                address: toAcceptedAddressFormat(address),
                id: '0',
                type: 't721',
                password: hashedp,
                wallet: encrypted_string,
                role: 'authenticated',
            });

            verify(
                userEntityModelMock.search(
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
                ),
            ).called();
        });

        test('unexpected search error', async function() {
            const usersService: UsersService = context.usersService;
            const userEntityModelMock: UserEntityModelMock =
                context.userEntityModelMock;

            const email = 'test@test.com';
            const wallet: Wallet = await createWallet();
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));

            const injected_cb = (options: any, cb: any): void => {
                cb({ error: 'exists' }, null);
            };

            when(
                userEntityModelMock.search(
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
                ),
            ).thenCall(injected_cb);

            const res = await usersService.findByEmail(email);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                userEntityModelMock.search(
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
                ),
            ).called();
        });

        test('search with no hits', async function() {
            const usersService: UsersService = context.usersService;
            const userEntityModelMock: UserEntityModelMock =
                context.userEntityModelMock;

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
                } as ESSearchReturn<UserEntity>);
            };

            when(
                userEntityModelMock.search(
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
                ),
            ).thenCall(injected_cb);

            const res = await usersService.findByEmail(email);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(null);

            verify(
                userEntityModelMock.search(
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
                ),
            ).called();
        });
    });

    describe('create', function() {
        test('should create user', async function() {
            const usersService: UsersService = context.usersService;
            const usersRepositoryMock: UsersRepository =
                context.usersRepositoryMock;

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
                locale: 'en',
                valid: false,
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
                    toPromise: generated_cb,
                };
            };

            when(usersRepositoryMock.create(deepEqual(create_args))).thenReturn(
                entity,
            );
            when(usersRepositoryMock.save(deepEqual(entity))).thenCall(
                injected_cb,
            );

            const res = await usersService.create(
                create_args as CreateUserServiceInputDto,
            );

            verify(usersRepositoryMock.create(deepEqual(create_args))).called();
            verify(usersRepositoryMock.save(deepEqual(entity))).called();

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(entity);
        });

        test('should return unexpected error', async function() {
            const usersService: UsersService = context.usersService;
            const usersRepositoryMock: UsersRepository =
                context.usersRepositoryMock;

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
                role: 'authenticated',
                locale: 'en',
                valid: false,
            } as Partial<UserEntity>;

            const entity = {
                ...create_args,
                id: '0',
            } as UserEntity;

            const injected_cb = (): any => {
                throw new Error('Unexpected internal error');
            };

            when(usersRepositoryMock.create(deepEqual(create_args))).thenReturn(
                entity,
            );
            when(usersRepositoryMock.save(deepEqual(entity))).thenCall(
                injected_cb,
            );

            const res = await usersService.create(
                create_args as CreateUserServiceInputDto,
            );

            verify(usersRepositoryMock.create(deepEqual(create_args))).called();
            verify(usersRepositoryMock.save(deepEqual(entity))).called();

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);
        });
    });

    describe('update', function() {
        it('should update user', async function() {
            const usersService: UsersService = context.usersService;
            const userEntityModelMock: UserEntityModelMock =
                context.userEntityModelMock;
            const usersRepositoryMock: UsersRepository =
                context.usersRepositoryMock;

            const email = 'test@test.com';
            const username = 'salut';
            const wallet: Wallet = await createWallet();
            const address = wallet.address;
            const hashedp = toAcceptedKeccak256Format(keccak256('salut'));
            const encrypted_string = await encryptWallet(wallet, hashedp);
            const id = '00000000-0000-0000-0000-000000000000';

            const generated_cb = async (): Promise<UserEntity> => {
                return {
                    username,
                    email,
                    wallet: encrypted_string,
                    address,
                    password: hashedp,
                    id,
                    type: 't721',
                    role: 'authenticated',
                    locale: 'en',
                    valid: false,
                };
            };

            const injected_cb = (): any => {
                return {
                    toPromise: generated_cb,
                };
            };

            const injected_update_cb = (): any => {
                return {
                    toPromise: () => {},
                };
            };

            when(
                usersRepositoryMock.findOne(deepEqual({ id: uuid(id) as any })),
            ).thenCall(injected_cb);

            when(
                usersRepositoryMock.update(
                    deepEqual({ id: uuid(id) as any }),
                    deepEqual({
                        valid: true,
                    }),
                ),
            ).thenCall(injected_update_cb);

            const res = await usersService.update({
                id,
                valid: true,
            });

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                username,
                email,
                wallet: encrypted_string,
                address,
                password: hashedp,
                id,
                type: 't721',
                role: 'authenticated',
                locale: 'en',
                valid: false,
            });
        });

        it('should report update error', async function() {
            const usersService: UsersService = context.usersService;
            const usersRepositoryMock: UsersRepository =
                context.usersRepositoryMock;

            const id = '00000000-0000-0000-0000-000000000000';

            when(
                usersRepositoryMock.update(
                    deepEqual({ id: uuid(id) as any }),
                    deepEqual({
                        valid: true,
                    }),
                ),
            ).thenThrow(new Error('an error'));

            const res = await usersService.update({
                id,
                valid: true,
            });

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);
        });
    });
});
