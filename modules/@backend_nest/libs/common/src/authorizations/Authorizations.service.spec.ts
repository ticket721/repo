import { TicketMintingFormat } from '@lib/common/utils/Cart.type';
import { CurrenciesService, ERC20Currency, Price } from '@lib/common/currencies/Currencies.service';
import { DAY, HOUR } from '@lib/common/utils/time';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { AuthorizationsRepository } from '@lib/common/authorizations/Authorizations.repository';
import { AuthorizationEntity } from '@lib/common/authorizations/entities/Authorization.entity';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { DatesService } from '@lib/common/dates/Dates.service';
import { EventsService } from '@lib/common/events/Events.service';
import { T721ControllerV0Service } from '@lib/common/contracts/t721controller/T721Controller.V0.service';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { VaultereumService } from '@lib/common/vaultereum/Vaultereum.service';
import { AuthorizationsService } from '@lib/common/authorizations/Authorizations.service';
import { anyString, anything, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@iaminfinity/express-cassandra/dist/utils/cassandra-orm.utils';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { BytesToolService } from '@lib/common/toolbox/Bytes.tool.service';
import { encode, MintAuthorization, toB32 } from '@common/global';
import { TimeToolService } from '@lib/common/toolbox/Time.tool.service';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';

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
        datesServiceMock: DatesService;
        eventsServiceMock: EventsService;
        t721ControllerV0ServiceMock: T721ControllerV0Service;
        currenciesServiceMock: CurrenciesService;
        web3ServiceMock: Web3Service;
        vaultereumServiceMock: VaultereumService;
        bytesToolServiceMock: BytesToolService;
        timeToolServiceMock: TimeToolService;
    } = {
        authorizationsService: null,
        authorizationsRepositoryMock: null,
        authorizationEntityMock: null,
        categoriesServiceMock: null,
        datesServiceMock: null,
        eventsServiceMock: null,
        t721ControllerV0ServiceMock: null,
        currenciesServiceMock: null,
        web3ServiceMock: null,
        vaultereumServiceMock: null,
        bytesToolServiceMock: null,
        timeToolServiceMock: null,
    };

    beforeEach(async function() {
        context.authorizationsRepositoryMock = mock(AuthorizationsRepository);
        context.authorizationEntityMock = mock(AuthorizationEntityModelMock);
        context.categoriesServiceMock = mock(CategoriesService);
        context.datesServiceMock = mock(DatesService);
        context.eventsServiceMock = mock(EventsService);
        context.t721ControllerV0ServiceMock = mock(T721ControllerV0Service);
        context.currenciesServiceMock = mock(CurrenciesService);
        context.web3ServiceMock = mock(Web3Service);
        context.vaultereumServiceMock = mock(VaultereumService);
        context.bytesToolServiceMock = mock(BytesToolService);
        context.timeToolServiceMock = mock(TimeToolService);

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
                    provide: DatesService,
                    useValue: instance(context.datesServiceMock),
                },
                {
                    provide: EventsService,
                    useValue: instance(context.eventsServiceMock),
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
                    provide: VaultereumService,
                    useValue: instance(context.vaultereumServiceMock),
                },
                {
                    provide: BytesToolService,
                    useValue: instance(context.bytesToolServiceMock),
                },
                {
                    provide: TimeToolService,
                    useValue: instance(context.timeToolServiceMock),
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

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: groupId,
                        parent_type: 'date',
                        parent_id: 'date_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.datesServiceMock.search(
                    deepEqual({
                        id: 'date_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        parent_id: 'event_id',
                    } as DateEntity,
                ],
            });

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: 'event_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        address: eventAddress,
                        controller: 'eventcontroller',
                    } as EventEntity,
                ],
            });

            const randomNum = '012345678901234567890123456789012345678901234567890123456789ff';

            when(context.bytesToolServiceMock.randomBytes(31)).thenReturn(randomNum);

            const signer = async (...args: any[]) => ({
                r: '0xr',
                v: 1,
                s: '0xs',
                hex: '0xsignature',
            });

            when(context.vaultereumServiceMock.getSigner('eventcontroller')).thenReturn(signer);

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

            const res = await context.authorizationsService.validateTicketAuthorizations(
                authorizations,
                prices,
                expirationTime,
                grantee,
                signatureReadable,
            );

            expect(res.error).toEqual(null);
            expect(res.response).toEqual([
                {
                    granter: eventAddress,
                    grantee: userAddress,
                    granterController: 'eventcontroller',
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
                context.datesServiceMock.search(
                    deepEqual({
                        id: 'date_id',
                    }),
                ),
            ).called();

            verify(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: 'event_id',
                    }),
                ),
            ).called();

            verify(context.bytesToolServiceMock.randomBytes(31)).called();

            verify(context.vaultereumServiceMock.getSigner('eventcontroller')).called();

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

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: groupId,
                        parent_type: 'event',
                        parent_id: 'event_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: 'event_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        address: eventAddress,
                        controller: 'eventcontroller',
                    } as EventEntity,
                ],
            });

            const randomNum = '012345678901234567890123456789012345678901234567890123456789ff';

            when(context.bytesToolServiceMock.randomBytes(31)).thenReturn(randomNum);

            const signer = async (...args: any[]) => ({
                r: '0xr',
                v: 1,
                s: '0xs',
                hex: '0xsignature',
            });

            when(context.vaultereumServiceMock.getSigner('eventcontroller')).thenReturn(signer);

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

            const res = await context.authorizationsService.validateTicketAuthorizations(
                authorizations,
                prices,
                expirationTime,
                grantee,
                signatureReadable,
            );

            expect(res.error).toEqual(null);
            expect(res.response).toEqual([
                {
                    granter: eventAddress,
                    grantee: userAddress,
                    granterController: 'eventcontroller',
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
                context.eventsServiceMock.search(
                    deepEqual({
                        id: 'event_id',
                    }),
                ),
            ).called();

            verify(context.bytesToolServiceMock.randomBytes(31)).called();

            verify(context.vaultereumServiceMock.getSigner('eventcontroller')).called();

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

            const res = await context.authorizationsService.validateTicketAuthorizations(
                authorizations,
                prices,
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
                error: null,
                response: [],
            });

            const res = await context.authorizationsService.validateTicketAuthorizations(
                authorizations,
                prices,
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

        it('should fail on dates search error', async function() {
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
                error: null,
                response: [
                    {
                        id: 'category_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: groupId,
                        parent_type: 'date',
                        parent_id: 'date_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.datesServiceMock.search(
                    deepEqual({
                        id: 'date_id',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.authorizationsService.validateTicketAuthorizations(
                authorizations,
                prices,
                expirationTime,
                grantee,
                signatureReadable,
            );

            expect(res.error).toEqual('cannot_resolve_date');
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
                context.datesServiceMock.search(
                    deepEqual({
                        id: 'date_id',
                    }),
                ),
            ).called();
        });

        it('should fail on empty dates search', async function() {
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
                error: null,
                response: [
                    {
                        id: 'category_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: groupId,
                        parent_type: 'date',
                        parent_id: 'date_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.datesServiceMock.search(
                    deepEqual({
                        id: 'date_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            const res = await context.authorizationsService.validateTicketAuthorizations(
                authorizations,
                prices,
                expirationTime,
                grantee,
                signatureReadable,
            );

            expect(res.error).toEqual('cannot_resolve_date');
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
                context.datesServiceMock.search(
                    deepEqual({
                        id: 'date_id',
                    }),
                ),
            ).called();
        });

        it('should fail on event search error', async function() {
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
                error: null,
                response: [
                    {
                        id: 'category_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: groupId,
                        parent_type: 'date',
                        parent_id: 'date_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.datesServiceMock.search(
                    deepEqual({
                        id: 'date_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        parent_id: 'event_id',
                    } as DateEntity,
                ],
            });

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: 'event_id',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.authorizationsService.validateTicketAuthorizations(
                authorizations,
                prices,
                expirationTime,
                grantee,
                signatureReadable,
            );

            expect(res.error).toEqual('cannot_resolve_event');
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
                context.datesServiceMock.search(
                    deepEqual({
                        id: 'date_id',
                    }),
                ),
            ).called();

            verify(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: 'event_id',
                    }),
                ),
            ).called();
        });

        it('should fail on empty event search', async function() {
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
                error: null,
                response: [
                    {
                        id: 'category_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: groupId,
                        parent_type: 'date',
                        parent_id: 'date_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.datesServiceMock.search(
                    deepEqual({
                        id: 'date_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        parent_id: 'event_id',
                    } as DateEntity,
                ],
            });

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: 'event_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            const res = await context.authorizationsService.validateTicketAuthorizations(
                authorizations,
                prices,
                expirationTime,
                grantee,
                signatureReadable,
            );

            expect(res.error).toEqual('cannot_resolve_event');
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
                context.datesServiceMock.search(
                    deepEqual({
                        id: 'date_id',
                    }),
                ),
            ).called();

            verify(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: 'event_id',
                    }),
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

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: groupId,
                        parent_type: 'date',
                        parent_id: 'date_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.datesServiceMock.search(
                    deepEqual({
                        id: 'date_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        parent_id: 'event_id',
                    } as DateEntity,
                ],
            });

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: 'event_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        address: eventAddress,
                        controller: 'eventcontroller',
                    } as EventEntity,
                ],
            });

            const randomNum = '012345678901234567890123456789012345678901234567890123456789ff';

            when(context.bytesToolServiceMock.randomBytes(31)).thenReturn(randomNum);

            const signer = async (...args: any[]) => {
                throw new Error('signature error');
            };

            when(context.vaultereumServiceMock.getSigner('eventcontroller')).thenReturn(signer);

            const res = await context.authorizationsService.validateTicketAuthorizations(
                authorizations,
                prices,
                expirationTime,
                grantee,
                signatureReadable,
            );

            expect(res.error).toEqual('vaultereum_signature_failure');
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
                context.datesServiceMock.search(
                    deepEqual({
                        id: 'date_id',
                    }),
                ),
            ).called();

            verify(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: 'event_id',
                    }),
                ),
            ).called();

            verify(context.bytesToolServiceMock.randomBytes(31)).called();

            verify(context.vaultereumServiceMock.getSigner('eventcontroller')).called();
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

            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: 'category_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'category_id',
                        seats: 100,
                        reserved: 90,
                        category_name: 'vip',
                        group_id: groupId,
                        parent_type: 'date',
                        parent_id: 'date_id',
                    } as CategoryEntity,
                ],
            });

            when(
                context.datesServiceMock.search(
                    deepEqual({
                        id: 'date_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        parent_id: 'event_id',
                    } as DateEntity,
                ],
            });

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: 'event_id',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        address: eventAddress,
                        controller: 'eventcontroller',
                    } as EventEntity,
                ],
            });

            const randomNum = '012345678901234567890123456789012345678901234567890123456789ff';

            when(context.bytesToolServiceMock.randomBytes(31)).thenReturn(randomNum);

            const signer = async (...args: any[]) => ({
                r: '0xr',
                v: 1,
                s: '0xs',
                hex: '0xsignature',
            });

            when(context.vaultereumServiceMock.getSigner('eventcontroller')).thenReturn(signer);

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

            const res = await context.authorizationsService.validateTicketAuthorizations(
                authorizations,
                prices,
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
                context.datesServiceMock.search(
                    deepEqual({
                        id: 'date_id',
                    }),
                ),
            ).called();

            verify(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: 'event_id',
                    }),
                ),
            ).called();

            verify(context.bytesToolServiceMock.randomBytes(31)).called();

            verify(context.vaultereumServiceMock.getSigner('eventcontroller')).called();

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
