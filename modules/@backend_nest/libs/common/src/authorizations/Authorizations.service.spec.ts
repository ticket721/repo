import { TicketMintingFormat } from '@lib/common/utils/Cart.type';
import { CurrenciesService, ERC20Currency, Price } from '@lib/common/currencies/Currencies.service';
import { DAY, HOUR } from '@lib/common/utils/time';
import { AuthorizationsRepository } from '@lib/common/authorizations/Authorizations.repository';
import { AuthorizationEntity } from '@lib/common/authorizations/entities/Authorization.entity';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { T721ControllerV0Service } from '@lib/common/contracts/t721controller/T721Controller.V0.service';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { AuthorizationsService } from '@lib/common/authorizations/Authorizations.service';
import { deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@iaminfinity/express-cassandra/dist/utils/cassandra-orm.utils';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { BytesToolService } from '@lib/common/toolbox/Bytes.tool.service';
import { encode, MintAuthorization, toB32 } from '@common/global';
import { TimeToolService } from '@lib/common/toolbox/Time.tool.service';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';
import { GroupService } from '@lib/common/group/Group.service';
import { RocksideService } from '@lib/common/rockside/Rockside.service';
import { NestError } from '@lib/common/utils/NestError';

class AuthorizationEntityModelMock {
    _properties;
    search(options: EsSearchOptionsStatic, callback?: (err: any, ret: any) => void): void {
        return;
    }
}

describe('Authorizations Service', function() {
    const context: {
        authorizationsService: AuthorizationsService;
        authorizationsRepositoryMock: AuthorizationsRepository;
        authorizationEntityMock: AuthorizationEntityModelMock;

        categoriesServiceMock: CategoriesService;
        t721ControllerV0ServiceMock: T721ControllerV0Service;
        currenciesServiceMock: CurrenciesService;
        web3ServiceMock: Web3Service;
        bytesToolServiceMock: BytesToolService;
        timeToolServiceMock: TimeToolService;
        groupServiceMock: GroupService;
        rocksideServiceMock: RocksideService;
    } = {
        authorizationsService: null,
        authorizationsRepositoryMock: null,
        authorizationEntityMock: null,

        categoriesServiceMock: null,
        t721ControllerV0ServiceMock: null,
        currenciesServiceMock: null,
        web3ServiceMock: null,
        bytesToolServiceMock: null,
        timeToolServiceMock: null,
        groupServiceMock: null,
        rocksideServiceMock: null,
    };

    beforeEach(async function() {
        context.authorizationsRepositoryMock = mock(AuthorizationsRepository);
        context.authorizationEntityMock = mock(AuthorizationEntityModelMock);

        context.categoriesServiceMock = mock(CategoriesService);
        context.t721ControllerV0ServiceMock = mock(T721ControllerV0Service);
        context.currenciesServiceMock = mock(CurrenciesService);
        context.web3ServiceMock = mock(Web3Service);
        context.bytesToolServiceMock = mock(BytesToolService);
        context.timeToolServiceMock = mock(TimeToolService);
        context.groupServiceMock = mock(GroupService);
        context.rocksideServiceMock = mock(RocksideService);

        when(context.authorizationEntityMock._properties).thenReturn({
            schema: {
                fields: {},
            },
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: AuthorizationsRepository,
                    useValue: instance(context.authorizationsRepositoryMock),
                },
                {
                    provide: getModelToken(AuthorizationEntity),
                    useValue: instance(context.authorizationEntityMock),
                },

                {
                    provide: CategoriesService,
                    useValue: instance(context.categoriesServiceMock),
                },
                {
                    provide: T721ControllerV0Service,
                    useValue: instance(context.t721ControllerV0ServiceMock),
                },
                {
                    provide: CurrenciesService,
                    useValue: instance(context.currenciesServiceMock),
                },
                {
                    provide: Web3Service,
                    useValue: instance(context.web3ServiceMock),
                },
                {
                    provide: BytesToolService,
                    useValue: instance(context.bytesToolServiceMock),
                },
                {
                    provide: TimeToolService,
                    useValue: instance(context.timeToolServiceMock),
                },
                {
                    provide: GroupService,
                    useValue: instance(context.groupServiceMock),
                },
                {
                    provide: RocksideService,
                    useValue: instance(context.rocksideServiceMock),
                },
                AuthorizationsService,
            ],
        }).compile();

        context.authorizationsService = module.get<AuthorizationsService>(AuthorizationsService);
    });

    describe('validateTicketAuthorizations', function() {
        it('should properly create the new ready-to-use authorizations', async function() {
            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const tokenAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d2';
            const t721controllerAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d3';
            const eventAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d4';
            const userAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d5';
            const groupId = '0xabcdef1234abcdef1234abcdef1234abcdef1234abcdef1234abcdef1234abcd';

            const grantee = userAddress;

            when(context.currenciesServiceMock.get('T721Token')).thenResolve({
                address: tokenAddress,
            } as ERC20Currency);

            const t721Instance = {
                _address: t721controllerAddress,
                methods: {
                    isCodeConsummable: (...args: any[]) => ({
                        call: async () => true,
                    }),
                },
            };

            when(context.t721ControllerV0ServiceMock.get()).thenResolve(t721Instance);

            when(context.web3ServiceMock.net()).thenResolve(1);

            const now = new Date(Date.now());

            when(context.timeToolServiceMock.now()).thenReturn(now);

            const categoryEntity = {
                id: 'category_id',
                seats: 100,
                reserved: 90,
                category_name: 'vip',
                group_id: groupId,
                parent_type: 'date',
                parent_id: 'date_id',
            } as CategoryEntity;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [categoryEntity],
            });

            when(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity),
                    deepEqual(['address', 'controller']),
                ),
            ).thenResolve({
                response: [eventAddress, eventAddress],
                error: null,
            });

            when(context.rocksideServiceMock.getSigner(eventAddress)).thenReturn(async () => ({
                hex: '0xsignature',
                r: '0xr',
                v: 1,
                s: '0xs',
            }));

            const randomNum = '012345678901234567890123456789012345678901234567890123456789ff';

            when(context.bytesToolServiceMock.randomBytes(31)).thenReturn(randomNum);

            const spiedService = spy(context.authorizationsService);

            when(
                spiedService.create(
                    deepEqual({
                        grantee: userAddress,
                        granter: eventAddress,
                        mode: 'mint',
                        signature: '0xsignature',
                        readable_signature: signatureReadable,
                        cancelled: false,
                        consumed: false,
                        dispatched: false,
                        codes: MintAuthorization.toCodesFormat(`0x${randomNum}`),
                        args: MintAuthorization.toArgsFormat(
                            MintAuthorization.encodePrices([
                                {
                                    currency: tokenAddress,
                                    value: encode(['uint256'], ['100']),
                                    fee: '0',
                                },
                            ]),
                            groupId,
                            toB32('vip'),
                            `0x${randomNum}`,
                            Math.floor((now.getTime() + expirationTime) / 1000),
                        ),
                        selectors: MintAuthorization.toSelectorFormat(groupId, toB32('vip')),
                        user_expiration: new Date(Math.floor((now.getTime() + expirationTime) / 1000) * 1000),
                        be_expiration: new Date(Math.floor((now.getTime() + expirationTime + HOUR) / 1000) * 1000),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    id: 'authorization_id',
                    grantee: userAddress,
                    granter: eventAddress,
                    mode: 'mint',
                    signature: '0xsignature',
                    readable_signature: signatureReadable,
                    cancelled: false,
                    consumed: false,
                    dispatched: false,
                    codes: MintAuthorization.toCodesFormat(`0x${randomNum}`),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices([
                            {
                                currency: tokenAddress,
                                value: encode(['uint256'], ['100']),
                                fee: '0',
                            },
                        ]),
                        groupId,
                        toB32('vip'),
                        `0x${randomNum}`,
                        Math.floor((now.getTime() + expirationTime) / 1000),
                    ),
                    selectors: MintAuthorization.toSelectorFormat(groupId, toB32('vip')),
                    user_expiration: new Date(Math.floor((now.getTime() + expirationTime) / 1000) * 1000),
                    be_expiration: new Date(Math.floor((now.getTime() + expirationTime + HOUR) / 1000) * 1000),
                    created_at: now,
                    updated_at: now,
                },
            });

            const fees = ['0'];

            const res = await context.authorizationsService.validateTicketAuthorizations(
                authorizations,
                prices,
                fees,
                expirationTime,
                grantee,
                signatureReadable,
            );

            expect(res.error).toEqual(null);
            expect(res.response).toEqual([
                {
                    granter: eventAddress,
                    grantee: userAddress,
                    granterController: eventAddress,
                    groupId,
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_id',
                    categoryId: 'category_id',
                    categoryName: 'vip',
                    expiration: new Date(Math.floor((now.getTime() + expirationTime) / 1000) * 1000),
                },
            ]);

            verify(context.currenciesServiceMock.get('T721Token')).called();

            verify(context.t721ControllerV0ServiceMock.get()).called();

            verify(context.web3ServiceMock.net()).called();

            verify(context.timeToolServiceMock.now()).called();

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).called();

            verify(context.bytesToolServiceMock.randomBytes(31)).called();

            verify(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity),
                    deepEqual(['address', 'controller']),
                ),
            ).called();

            verify(context.rocksideServiceMock.getSigner(eventAddress)).called();

            verify(
                spiedService.create(
                    deepEqual({
                        grantee: userAddress,
                        granter: eventAddress,
                        mode: 'mint',
                        signature: '0xsignature',
                        readable_signature: signatureReadable,
                        cancelled: false,
                        consumed: false,
                        dispatched: false,
                        codes: MintAuthorization.toCodesFormat(`0x${randomNum}`),
                        args: MintAuthorization.toArgsFormat(
                            MintAuthorization.encodePrices([
                                {
                                    currency: tokenAddress,
                                    value: encode(['uint256'], ['100']),
                                    fee: '0',
                                },
                            ]),
                            groupId,
                            toB32('vip'),
                            `0x${randomNum}`,
                            Math.floor((now.getTime() + expirationTime) / 1000),
                        ),
                        selectors: MintAuthorization.toSelectorFormat(groupId, toB32('vip')),
                        user_expiration: new Date(Math.floor((now.getTime() + expirationTime) / 1000) * 1000),
                        be_expiration: new Date(Math.floor((now.getTime() + expirationTime + HOUR) / 1000) * 1000),
                    }),
                ),
            ).called();
        });

        it('should properly create the new ready-to-use authorizations (event category case)', async function() {
            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const tokenAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d2';
            const t721controllerAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d3';
            const eventAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d4';
            const userAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d5';
            const groupId = '0xabcdef1234abcdef1234abcdef1234abcdef1234abcdef1234abcdef1234abcd';

            const grantee = userAddress;

            when(context.currenciesServiceMock.get('T721Token')).thenResolve({
                address: tokenAddress,
            } as ERC20Currency);

            const t721Instance = {
                _address: t721controllerAddress,
                methods: {
                    isCodeConsummable: (...args: any[]) => ({
                        call: async () => true,
                    }),
                },
            };

            when(context.t721ControllerV0ServiceMock.get()).thenResolve(t721Instance);

            when(context.web3ServiceMock.net()).thenResolve(1);

            const now = new Date(Date.now());

            when(context.timeToolServiceMock.now()).thenReturn(now);

            const categoryEntity = {
                id: 'category_id',
                seats: 100,
                reserved: 90,
                category_name: 'vip',
                group_id: groupId,
                parent_type: 'event',
                parent_id: 'event_id',
            } as CategoryEntity;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [categoryEntity],
            });

            when(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity),
                    deepEqual(['address', 'controller']),
                ),
            ).thenResolve({
                response: [eventAddress, eventAddress],
                error: null,
            });

            when(context.rocksideServiceMock.getSigner(eventAddress)).thenReturn(async () => ({
                hex: '0xsignature',
                r: '0xr',
                v: 1,
                s: '0xs',
            }));

            const randomNum = '012345678901234567890123456789012345678901234567890123456789ff';

            when(context.bytesToolServiceMock.randomBytes(31)).thenReturn(randomNum);

            const spiedService = spy(context.authorizationsService);

            when(
                spiedService.create(
                    deepEqual({
                        grantee: userAddress,
                        granter: eventAddress,
                        mode: 'mint',
                        signature: '0xsignature',
                        readable_signature: signatureReadable,
                        cancelled: false,
                        consumed: false,
                        dispatched: false,
                        codes: MintAuthorization.toCodesFormat(`0x${randomNum}`),
                        args: MintAuthorization.toArgsFormat(
                            MintAuthorization.encodePrices([
                                {
                                    currency: tokenAddress,
                                    value: encode(['uint256'], ['100']),
                                    fee: '0',
                                },
                            ]),
                            groupId,
                            toB32('vip'),
                            `0x${randomNum}`,
                            Math.floor((now.getTime() + expirationTime) / 1000),
                        ),
                        selectors: MintAuthorization.toSelectorFormat(groupId, toB32('vip')),
                        user_expiration: new Date(Math.floor((now.getTime() + expirationTime) / 1000) * 1000),
                        be_expiration: new Date(Math.floor((now.getTime() + expirationTime + HOUR) / 1000) * 1000),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    id: 'authorization_id',
                    grantee: userAddress,
                    granter: eventAddress,
                    mode: 'mint',
                    signature: '0xsignature',
                    readable_signature: signatureReadable,
                    cancelled: false,
                    consumed: false,
                    dispatched: false,
                    codes: MintAuthorization.toCodesFormat(`0x${randomNum}`),
                    args: MintAuthorization.toArgsFormat(
                        MintAuthorization.encodePrices([
                            {
                                currency: tokenAddress,
                                value: encode(['uint256'], ['100']),
                                fee: '0',
                            },
                        ]),
                        groupId,
                        toB32('vip'),
                        `0x${randomNum}`,
                        Math.floor((now.getTime() + expirationTime) / 1000),
                    ),
                    selectors: MintAuthorization.toSelectorFormat(groupId, toB32('vip')),
                    user_expiration: new Date(Math.floor((now.getTime() + expirationTime) / 1000) * 1000),
                    be_expiration: new Date(Math.floor((now.getTime() + expirationTime + HOUR) / 1000) * 1000),
                    created_at: now,
                    updated_at: now,
                },
            });

            const fees = ['0'];

            const res = await context.authorizationsService.validateTicketAuthorizations(
                authorizations,
                prices,
                fees,
                expirationTime,
                grantee,
                signatureReadable,
            );

            expect(res.error).toEqual(null);
            expect(res.response).toEqual([
                {
                    granter: eventAddress,
                    grantee: userAddress,
                    granterController: eventAddress,
                    groupId,
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                    authorizationId: 'authorization_id',
                    categoryId: 'category_id',
                    categoryName: 'vip',
                    expiration: new Date(Math.floor((now.getTime() + expirationTime) / 1000) * 1000),
                },
            ]);

            verify(context.currenciesServiceMock.get('T721Token')).called();

            verify(context.t721ControllerV0ServiceMock.get()).called();

            verify(context.web3ServiceMock.net()).called();

            verify(context.timeToolServiceMock.now()).called();

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).called();

            verify(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity),
                    deepEqual(['address', 'controller']),
                ),
            ).called();

            verify(context.rocksideServiceMock.getSigner(eventAddress)).called();

            verify(context.bytesToolServiceMock.randomBytes(31)).called();

            verify(
                spiedService.create(
                    deepEqual({
                        grantee: userAddress,
                        granter: eventAddress,
                        mode: 'mint',
                        signature: '0xsignature',
                        readable_signature: signatureReadable,
                        cancelled: false,
                        consumed: false,
                        dispatched: false,
                        codes: MintAuthorization.toCodesFormat(`0x${randomNum}`),
                        args: MintAuthorization.toArgsFormat(
                            MintAuthorization.encodePrices([
                                {
                                    currency: tokenAddress,
                                    value: encode(['uint256'], ['100']),
                                    fee: '0',
                                },
                            ]),
                            groupId,
                            toB32('vip'),
                            `0x${randomNum}`,
                            Math.floor((now.getTime() + expirationTime) / 1000),
                        ),
                        selectors: MintAuthorization.toSelectorFormat(groupId, toB32('vip')),
                        user_expiration: new Date(Math.floor((now.getTime() + expirationTime) / 1000) * 1000),
                        be_expiration: new Date(Math.floor((now.getTime() + expirationTime + HOUR) / 1000) * 1000),
                    }),
                ),
            ).called();
        });

        it('should fail on invalid fee length', async function() {
            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const userAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d5';

            const grantee = userAddress;

            const fees = [];

            const res = await context.authorizationsService.validateTicketAuthorizations(
                authorizations,
                prices,
                fees,
                expirationTime,
                grantee,
                signatureReadable,
            );

            expect(res.error).toEqual('invalid_fee_price_lengths');
            expect(res.response).toEqual(null);
        });

        it('should fail on categories fetch error', async function() {
            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const tokenAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d2';
            const t721controllerAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d3';
            const eventAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d4';
            const userAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d5';
            const groupId = '0xabcdef1234abcdef1234abcdef1234abcdef1234abcdef1234abcdef1234abcd';

            const grantee = userAddress;

            when(context.currenciesServiceMock.get('T721Token')).thenResolve({
                address: tokenAddress,
            } as ERC20Currency);

            const t721Instance = {
                _address: t721controllerAddress,
                methods: {
                    isCodeConsummable: (...args: any[]) => ({
                        call: async () => true,
                    }),
                },
            };

            when(context.t721ControllerV0ServiceMock.get()).thenResolve(t721Instance);

            when(context.web3ServiceMock.net()).thenResolve(1);

            const now = new Date(Date.now());

            when(context.timeToolServiceMock.now()).thenReturn(now);

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const fees = ['0'];

            const res = await context.authorizationsService.validateTicketAuthorizations(
                authorizations,
                prices,
                fees,
                expirationTime,
                grantee,
                signatureReadable,
            );

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(context.currenciesServiceMock.get('T721Token')).called();

            verify(context.t721ControllerV0ServiceMock.get()).called();

            verify(context.web3ServiceMock.net()).called();

            verify(context.timeToolServiceMock.now()).called();

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).called();
        });

        it('should fail on empty categories fetch', async function() {
            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const tokenAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d2';
            const t721controllerAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d3';
            const userAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d5';

            const grantee = userAddress;

            when(context.currenciesServiceMock.get('T721Token')).thenResolve({
                address: tokenAddress,
            } as ERC20Currency);

            const t721Instance = {
                _address: t721controllerAddress,
                methods: {
                    isCodeConsummable: (...args: any[]) => ({
                        call: async () => true,
                    }),
                },
            };

            when(context.t721ControllerV0ServiceMock.get()).thenResolve(t721Instance);

            when(context.web3ServiceMock.net()).thenResolve(1);

            const now = new Date(Date.now());

            when(context.timeToolServiceMock.now()).thenReturn(now);

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            const fees = ['0'];

            const res = await context.authorizationsService.validateTicketAuthorizations(
                authorizations,
                prices,
                fees,
                expirationTime,
                grantee,
                signatureReadable,
            );

            expect(res.error).toEqual('cannot_find_category');
            expect(res.response).toEqual(null);

            verify(context.currenciesServiceMock.get('T721Token')).called();

            verify(context.t721ControllerV0ServiceMock.get()).called();

            verify(context.web3ServiceMock.net()).called();

            verify(context.timeToolServiceMock.now()).called();

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).called();
        });

        it('should fail on controller fields resolution error', async function() {
            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const tokenAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d2';
            const t721controllerAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d3';
            const userAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d5';
            const groupId = '0xabcdef1234abcdef1234abcdef1234abcdef1234abcdef1234abcdef1234abcd';

            const grantee = userAddress;

            when(context.currenciesServiceMock.get('T721Token')).thenResolve({
                address: tokenAddress,
            } as ERC20Currency);

            const t721Instance = {
                _address: t721controllerAddress,
                methods: {
                    isCodeConsummable: (...args: any[]) => ({
                        call: async () => true,
                    }),
                },
            };

            when(context.t721ControllerV0ServiceMock.get()).thenResolve(t721Instance);

            when(context.web3ServiceMock.net()).thenResolve(1);

            const now = new Date(Date.now());

            when(context.timeToolServiceMock.now()).thenReturn(now);

            const categoryEntity = {
                id: 'category_id',
                seats: 100,
                reserved: 90,
                category_name: 'vip',
                group_id: groupId,
                parent_type: 'date',
                parent_id: 'date_id',
            } as CategoryEntity;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [categoryEntity],
            });

            when(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity),
                    deepEqual(['address', 'controller']),
                ),
            ).thenResolve({
                response: null,
                error: 'unexpected_error',
            });

            const fees = ['0'];

            const res = await context.authorizationsService.validateTicketAuthorizations(
                authorizations,
                prices,
                fees,
                expirationTime,
                grantee,
                signatureReadable,
            );

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(context.currenciesServiceMock.get('T721Token')).called();

            verify(context.t721ControllerV0ServiceMock.get()).called();

            verify(context.web3ServiceMock.net()).called();

            verify(context.timeToolServiceMock.now()).called();

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).called();

            verify(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity),
                    deepEqual(['address', 'controller']),
                ),
            ).called();
        });

        it('should fail on signer error', async function() {
            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const tokenAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d2';
            const t721controllerAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d3';
            const eventAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d4';
            const userAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d5';
            const groupId = '0xabcdef1234abcdef1234abcdef1234abcdef1234abcdef1234abcdef1234abcd';

            const grantee = userAddress;

            when(context.currenciesServiceMock.get('T721Token')).thenResolve({
                address: tokenAddress,
            } as ERC20Currency);

            const t721Instance = {
                _address: t721controllerAddress,
                methods: {
                    isCodeConsummable: (...args: any[]) => ({
                        call: async () => true,
                    }),
                },
            };

            when(context.t721ControllerV0ServiceMock.get()).thenResolve(t721Instance);

            when(context.web3ServiceMock.net()).thenResolve(1);

            const now = new Date(Date.now());

            when(context.timeToolServiceMock.now()).thenReturn(now);

            const categoryEntity = {
                id: 'category_id',
                seats: 100,
                reserved: 90,
                category_name: 'vip',
                group_id: groupId,
                parent_type: 'date',
                parent_id: 'date_id',
            } as CategoryEntity;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [categoryEntity],
            });

            when(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity),
                    deepEqual(['address', 'controller']),
                ),
            ).thenResolve({
                response: [eventAddress, eventAddress],
                error: null,
            });

            when(context.rocksideServiceMock.getSigner(eventAddress)).thenReturn(async () => {
                throw new NestError('signature error');
            });

            const randomNum = '012345678901234567890123456789012345678901234567890123456789ff';

            when(context.bytesToolServiceMock.randomBytes(31)).thenReturn(randomNum);

            const fees = ['0'];

            const res = await context.authorizationsService.validateTicketAuthorizations(
                authorizations,
                prices,
                fees,
                expirationTime,
                grantee,
                signatureReadable,
            );

            expect(res.error).toEqual('rockside_signature_failure');
            expect(res.response).toEqual(null);

            verify(context.currenciesServiceMock.get('T721Token')).called();

            verify(context.t721ControllerV0ServiceMock.get()).called();

            verify(context.web3ServiceMock.net()).called();

            verify(context.timeToolServiceMock.now()).called();

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).called();

            verify(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity),
                    deepEqual(['address', 'controller']),
                ),
            ).called();

            verify(context.rocksideServiceMock.getSigner(eventAddress)).called();

            verify(context.bytesToolServiceMock.randomBytes(31)).called();
        });

        it('should fail on authorization entity creation error', async function() {
            const authorizations: TicketMintingFormat[] = [
                {
                    categoryId: 'category_id',
                    price: {
                        currency: 'Fiat',
                        price: '100',
                    },
                },
            ];

            const prices: Price[] = [
                {
                    currency: 'T721Token',
                    value: '100',
                    log_value: 0,
                },
            ];

            const expirationTime = 2 * DAY;

            const signatureReadable = false;

            const tokenAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d2';
            const t721controllerAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d3';
            const eventAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d4';
            const userAddress = '0x686b0122d2b93f62e8553d59adec2593d47570d5';
            const groupId = '0xabcdef1234abcdef1234abcdef1234abcdef1234abcdef1234abcdef1234abcd';

            const grantee = userAddress;

            when(context.currenciesServiceMock.get('T721Token')).thenResolve({
                address: tokenAddress,
            } as ERC20Currency);

            const t721Instance = {
                _address: t721controllerAddress,
                methods: {
                    isCodeConsummable: (...args: any[]) => ({
                        call: async () => true,
                    }),
                },
            };

            when(context.t721ControllerV0ServiceMock.get()).thenResolve(t721Instance);

            when(context.web3ServiceMock.net()).thenResolve(1);

            const now = new Date(Date.now());

            when(context.timeToolServiceMock.now()).thenReturn(now);

            const categoryEntity = {
                id: 'category_id',
                seats: 100,
                reserved: 90,
                category_name: 'vip',
                group_id: groupId,
                parent_type: 'event',
                parent_id: 'event_id',
            } as CategoryEntity;

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [categoryEntity],
            });

            when(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity),
                    deepEqual(['address', 'controller']),
                ),
            ).thenResolve({
                response: [eventAddress, eventAddress],
                error: null,
            });

            when(context.rocksideServiceMock.getSigner(eventAddress)).thenReturn(async () => ({
                hex: '0xsignature',
                r: '0xr',
                v: 1,
                s: '0xs',
            }));

            const randomNum = '012345678901234567890123456789012345678901234567890123456789ff';

            when(context.bytesToolServiceMock.randomBytes(31)).thenReturn(randomNum);

            const spiedService = spy(context.authorizationsService);

            when(
                spiedService.create(
                    deepEqual({
                        grantee: userAddress,
                        granter: eventAddress,
                        mode: 'mint',
                        signature: '0xsignature',
                        readable_signature: signatureReadable,
                        cancelled: false,
                        consumed: false,
                        dispatched: false,
                        codes: MintAuthorization.toCodesFormat(`0x${randomNum}`),
                        args: MintAuthorization.toArgsFormat(
                            MintAuthorization.encodePrices([
                                {
                                    currency: tokenAddress,
                                    value: encode(['uint256'], ['100']),
                                    fee: '0',
                                },
                            ]),
                            groupId,
                            toB32('vip'),
                            `0x${randomNum}`,
                            Math.floor((now.getTime() + expirationTime) / 1000),
                        ),
                        selectors: MintAuthorization.toSelectorFormat(groupId, toB32('vip')),
                        user_expiration: new Date(Math.floor((now.getTime() + expirationTime) / 1000) * 1000),
                        be_expiration: new Date(Math.floor((now.getTime() + expirationTime + HOUR) / 1000) * 1000),
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const fees = ['0'];

            const res = await context.authorizationsService.validateTicketAuthorizations(
                authorizations,
                prices,
                fees,
                expirationTime,
                grantee,
                signatureReadable,
            );

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(context.currenciesServiceMock.get('T721Token')).called();

            verify(context.t721ControllerV0ServiceMock.get()).called();

            verify(context.web3ServiceMock.net()).called();

            verify(context.timeToolServiceMock.now()).called();

            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).called();

            verify(context.bytesToolServiceMock.randomBytes(31)).called();

            verify(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity),
                    deepEqual(['address', 'controller']),
                ),
            ).called();

            verify(context.rocksideServiceMock.getSigner(eventAddress)).called();

            verify(
                spiedService.create(
                    deepEqual({
                        grantee: userAddress,
                        granter: eventAddress,
                        mode: 'mint',
                        signature: '0xsignature',
                        readable_signature: signatureReadable,
                        cancelled: false,
                        consumed: false,
                        dispatched: false,
                        codes: MintAuthorization.toCodesFormat(`0x${randomNum}`),
                        args: MintAuthorization.toArgsFormat(
                            MintAuthorization.encodePrices([
                                {
                                    currency: tokenAddress,
                                    value: encode(['uint256'], ['100']),
                                    fee: '0',
                                },
                            ]),
                            groupId,
                            toB32('vip'),
                            `0x${randomNum}`,
                            Math.floor((now.getTime() + expirationTime) / 1000),
                        ),
                        selectors: MintAuthorization.toSelectorFormat(groupId, toB32('vip')),
                        user_expiration: new Date(Math.floor((now.getTime() + expirationTime) / 1000) * 1000),
                        be_expiration: new Date(Math.floor((now.getTime() + expirationTime + HOUR) / 1000) * 1000),
                    }),
                ),
            ).called();
        });
    });
});
