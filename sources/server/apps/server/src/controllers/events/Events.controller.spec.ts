import { Test, TestingModule } from '@nestjs/testing';
import {
    anything,
    deepEqual,
    instance,
    mock,
    spy,
    verify,
    when,
} from 'ts-mockito';
import { uuid } from '@iaminfinity/express-cassandra';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ESSearchReturn } from '@lib/common/utils/ESSearchReturn';
import { EventsController } from '@app/server/controllers/events/Events.controller';
import { EventsService } from '@lib/common/events/Events.service';
import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { EventsCreateResponseDto } from '@app/server/controllers/events/dto/EventsCreateResponse.dto';
import { StatusCodes } from '@lib/common/utils/codes';
import { ConfigService } from '@lib/common/config/Config.service';
import { CurrenciesService } from '@lib/common/currencies/Currencies.service';
import { DatesService } from '@lib/common/dates/Dates.service';
import { VaultereumService } from '@lib/common/vaultereum/Vaultereum.service';
import { TicketforgeService } from '@lib/common/contracts/Ticketforge.service';
import { T721AdminService } from '@lib/common/contracts/T721Admin.service';
import { RefractFactoryV0Service } from '@lib/common/contracts/refract/RefractFactory.V0.service';
import { TxsService } from '@lib/common/txs/Txs.service';
import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { toAcceptedAddressFormat, toB32 } from '@ticket721sources/global';
import { TxEntity } from '@lib/common/txs/entities/Tx.entity';

const context: {
    eventsController: EventsController;
    eventsServiceMock: EventsService;
    actionSetsServiceMock: ActionSetsService;
    configServiceMock: ConfigService;
    currenciesServiceMock: CurrenciesService;
    datesServiceMock: DatesService;
    vaultereumServiceMock: VaultereumService;
    ticketforgeServiceMock: TicketforgeService;
    t721AdminServiceMock: T721AdminService;
    refractFactoryServiceMock: RefractFactoryV0Service;
    txsServiceMock: TxsService;
} = {
    eventsController: null,
    eventsServiceMock: null,
    actionSetsServiceMock: null,
    configServiceMock: null,
    currenciesServiceMock: null,
    datesServiceMock: null,
    vaultereumServiceMock: null,
    ticketforgeServiceMock: null,
    t721AdminServiceMock: null,
    refractFactoryServiceMock: null,
    txsServiceMock: null,
};

describe('Events Controller', function() {
    beforeEach(async function() {
        context.eventsServiceMock = mock(EventsService);
        context.actionSetsServiceMock = mock(ActionSetsService);
        context.configServiceMock = mock(ConfigService);
        context.currenciesServiceMock = mock(CurrenciesService);
        context.datesServiceMock = mock(DatesService);
        context.vaultereumServiceMock = mock(VaultereumService);
        context.ticketforgeServiceMock = mock(TicketforgeService);
        context.t721AdminServiceMock = mock(T721AdminService);
        context.refractFactoryServiceMock = mock(RefractFactoryV0Service);
        context.txsServiceMock = mock(TxsService);

        const EventsServiceProvider = {
            provide: EventsService,
            useValue: instance(context.eventsServiceMock),
        };

        const ActionSetsServiceProvider = {
            provide: ActionSetsService,
            useValue: instance(context.actionSetsServiceMock),
        };

        const ConfigServiceProvider = {
            provide: ConfigService,
            useValue: instance(context.configServiceMock),
        };

        const CurrenciesServiceProvider = {
            provide: CurrenciesService,
            useValue: instance(context.currenciesServiceMock),
        };

        const DatesServiceProvider = {
            provide: DatesService,
            useValue: instance(context.datesServiceMock),
        };

        const VaultereumServiceProvider = {
            provide: VaultereumService,
            useValue: instance(context.vaultereumServiceMock),
        };

        const TicketforgeServiceProvider = {
            provide: TicketforgeService,
            useValue: instance(context.ticketforgeServiceMock),
        };

        const T721AdminServiceProvider = {
            provide: T721AdminService,
            useValue: instance(context.t721AdminServiceMock),
        };

        const RefractFactoryServiceProvider = {
            provide: RefractFactoryV0Service,
            useValue: instance(context.refractFactoryServiceMock),
        };

        const TxsServiceProvider = {
            provide: TxsService,
            useValue: instance(context.txsServiceMock),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventsServiceProvider,
                ActionSetsServiceProvider,
                ConfigServiceProvider,
                CurrenciesServiceProvider,
                DatesServiceProvider,
                VaultereumServiceProvider,
                TicketforgeServiceProvider,
                T721AdminServiceProvider,
                RefractFactoryServiceProvider,
                TxsServiceProvider,
            ],
            controllers: [EventsController],
        }).compile();

        context.eventsController = module.get<EventsController>(
            EventsController,
        );
    });

    describe('search', function() {
        test('should search for action sets', async function() {
            const query = {
                name: {
                    $eq: 'Test',
                },
            };

            const internalEsQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    name: 'Test',
                                },
                            },
                        },
                    },
                },
            };

            const entities: EventEntity[] = [
                {
                    status: 'preview',
                    address: null,
                    owner: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                    admins: [],
                    group_id: null,
                    id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                    name: 'Test',
                    avatar: 'https://...',
                    banners: ['https://...'],
                    dates: [
                        'ec677b12-d420-43a6-a597-ef84bf09f845',
                        'ec677b12-d420-43a6-a597-ef84bf09f845',
                    ],
                    description: 'An event',
                    categories: [],
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                },
            ];

            const esReturn: ESSearchReturn<EventEntity> = {
                took: 1,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 1,
                    hits: [
                        {
                            _index: 'yes',
                            _type: 'actionset',
                            _id: 'yes',
                            _score: 1,
                            _source: entities[0],
                        },
                    ],
                },
            };

            when(
                context.eventsServiceMock.searchElastic(
                    deepEqual(internalEsQuery),
                ),
            ).thenResolve({
                error: null,
                response: esReturn,
            });

            const res = await context.eventsController.search(query, {
                id: uuid('ec677b12-d420-43a6-a597-ef84bf09f845') as any,
            } as UserDto);

            expect(res.events).toEqual(entities);
        });
    });

    describe('create', function() {
        it('creates a new event creation action set', async function() {
            const body = {
                name: 'Event Name',
            };

            const entity: Partial<ActionSetEntity> = {
                name: '@events/creation',
                current_status: 'input:in progress',
                current_action: 0,
                owner: 'cb70b84f-2746-4afb-b789-01f4917f3b28',
                actions: [
                    {
                        name: '@events/textMetadata',
                        data: JSON.stringify(body),
                        status: 'in progress',
                        error: null,
                        type: 'input',
                    },
                    {
                        name: '@events/modulesConfiguration',
                        data: null,
                        status: 'in progress',
                        error: null,
                        type: 'input',
                    },
                    {
                        name: '@events/datesConfiguration',
                        data: null,
                        status: 'in progress',
                        error: null,
                        type: 'input',
                    },
                    {
                        name: '@events/categoriesConfiguration',
                        data: null,
                        status: 'in progress',
                        error: null,
                        type: 'input',
                    },
                    {
                        name: '@events/imagesMetadata',
                        data: null,
                        status: 'in progress',
                        error: null,
                        type: 'input',
                    },
                    {
                        name: '@events/adminsConfiguration',
                        data: null,
                        status: 'in progress',
                        error: null,
                        type: 'input',
                    },
                ],
                dispatched_at: anything(),
            };

            const extra_fields = {
                id: 'cb70b84f-2746-4afb-b789-01f4917f3b28',
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };

            when(
                context.actionSetsServiceMock.create(deepEqual(entity)),
            ).thenResolve({
                response: {
                    ...entity,
                    ...extra_fields,
                } as ActionSetEntity,
                error: null,
            });

            const res: EventsCreateResponseDto = await context.eventsController.create(
                body,
                {
                    id: 'cb70b84f-2746-4afb-b789-01f4917f3b28',
                } as UserDto,
            );

            expect(res.actionset).toEqual({
                ...entity,
                ...extra_fields,
            });
        });

        it('should throw on creation error', async function() {
            const body = {
                name: 'Event Name',
            };

            const entity: Partial<ActionSetEntity> = {
                name: '@events/creation',
                current_status: 'input:in progress',
                current_action: 0,
                owner: 'cb70b84f-2746-4afb-b789-01f4917f3b28',
                actions: [
                    {
                        name: '@events/textMetadata',
                        data: JSON.stringify(body),
                        status: 'in progress',
                        error: null,
                        type: 'input',
                    },
                    {
                        name: '@events/modulesConfiguration',
                        data: null,
                        status: 'in progress',
                        error: null,
                        type: 'input',
                    },
                    {
                        name: '@events/datesConfiguration',
                        data: null,
                        status: 'in progress',
                        error: null,
                        type: 'input',
                    },
                    {
                        name: '@events/categoriesConfiguration',
                        data: null,
                        status: 'in progress',
                        error: null,
                        type: 'input',
                    },
                    {
                        name: '@events/imagesMetadata',
                        data: null,
                        status: 'in progress',
                        error: null,
                        type: 'input',
                    },
                    {
                        name: '@events/adminsConfiguration',
                        data: null,
                        status: 'in progress',
                        error: null,
                        type: 'input',
                    },
                ],
                dispatched_at: anything(),
            };

            when(
                context.actionSetsServiceMock.create(deepEqual(entity)),
            ).thenResolve({
                response: null,
                error: 'unexpected error',
            });

            await expect(
                context.eventsController.create(body, {
                    id: 'cb70b84f-2746-4afb-b789-01f4917f3b28',
                } as UserDto),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.BadRequest,
                    message: 'unexpected error',
                },
                status: StatusCodes.BadRequest,
                message: {
                    status: StatusCodes.BadRequest,
                    message: 'unexpected error',
                },
            });
        });
    });

    describe('build', function() {
        it('should build actionset into event entity', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
            } as any) as UserDto;
            const actionSetId = '64f35afc-8e13-4f80-b9e6-00a6ef52a75d';
            const actionSet: ActionSetEntity = {
                id: actionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@events/textMetadata',
                        data:
                            '{"name":"Justice Woman WorldWide 2020","description":"Justice Concert","tags":["french","electro","disco"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/modulesConfiguration',
                        data: '{}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data:
                            '{"dates":[{"name":"La Cigale","eventBegin":"2020-02-20T09:02:57.492Z","eventEnd":"2020-02-21T09:02:57.492Z","location":{"label":"120 Boulevard de Rochechouart, 75018 Paris","lat":48.882301,"lon":2.34015},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}},{"name":"Bataclan","eventBegin":"2020-02-23T09:02:57.492Z","eventEnd":"2020-02-24T09:02:57.492Z","location":{"label":"50 Boulevard Voltaire, 75011 Paris","lat":48.86311,"lon":2.37087},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}}]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/categoriesConfiguration',
                        data:
                            '{"global":[{"name":"vip_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":100,"currencies":[{"currency":"Fiat","price":"100"}]}],"dates":[[{"name":"regular_0_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}],[{"name":"regular_1_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}]]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/imagesMetadata',
                        data:
                            '{"avatar":"e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb","banners":["decdea0b-2d00-4d57-b100-955f7ba41412","531d71c9-ee88-4989-8925-ed8be8a7f918"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/adminsConfiguration',
                        data: '{"admins":[]}',
                        type: 'input',
                        error: null,
                    },
                ],
                created_at: new Date('2020-02-19T09:02:57.553Z'),
                current_action: 5,
                current_status: 'complete',
                dispatched_at: new Date('2020-02-19T09:02:57.547Z'),
                name: '@events/creation',
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                updated_at: new Date('2020-02-19T09:03:02.999Z'),
            };
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: ('2020-02-20T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-21T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: ('2020-02-23T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-24T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            const eventAddress = '0x30199ec7ad0622c159cda3409a1f22a6dfe61de9';

            const vaultereumAddressResponse = {
                request_id: '30996fb5-3e85-0964-3c84-47f633396fb3',
                lease_id: '',
                renewable: false,
                lease_duration: 0,
                data: {
                    address: eventAddress,
                    blacklist: null,
                    spending_limit_total: '0',
                    spending_limit_tx: '0',
                    total_spend: '0',
                    whitelist: null,
                },
                wrap_info: null,
                warnings: null,
                auth: null,
            };

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [actionSet],
            });

            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(
                'ticket721_0',
            );

            when(context.currenciesServiceMock.get('Fiat')).thenResolve({
                type: 'set',
                name: 'Fiat',
                dollarPeg: 1,
                contains: ['T721Token'],
            });
            when(context.currenciesServiceMock.get('T721Token')).thenResolve({
                type: 'erc20',
                name: 'T721Token',
                module: 't721token',
                address: '0x813a9CDaa69b617baA5F220686670B42c6Af9EdD',
                dollarPeg: 1,
                controller: ({} as any) as ContractsControllerBase,
            });

            when(
                context.datesServiceMock.create(deepEqual(dates[0])),
            ).thenResolve({
                error: null,
                response: ({
                    ...dates[0],
                    id: dateIds[0],
                } as any) as DateEntity,
            });

            when(
                context.datesServiceMock.create(deepEqual(dates[1])),
            ).thenResolve({
                error: null,
                response: ({
                    ...dates[1],
                    id: dateIds[1],
                } as any) as DateEntity,
            });

            when(
                context.eventsServiceMock.create(deepEqual(event)),
            ).thenResolve({
                error: null,
                response: ({
                    ...event,
                    id: eventId,
                } as any) as EventEntity,
            });

            when(
                context.vaultereumServiceMock.write(
                    `ethereum/accounts/event-${eventId.toLowerCase()}`,
                ),
            ).thenResolve({
                error: null,
                response: vaultereumAddressResponse,
            });

            when(
                context.eventsServiceMock.update(
                    deepEqual({
                        id: eventId,
                    }),
                    deepEqual({
                        address: toAcceptedAddressFormat(eventAddress),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    ({
                        ...event,
                        id: eventId,
                        address: eventAddress,
                    } as any) as EventEntity,
                ],
            });

            const res = await context.eventsController.build(
                {
                    completedActionSet: actionSetId,
                },
                user,
            );

            expect(res).toEqual({
                event: {
                    ...event,
                    id: eventId,
                    address: eventAddress,
                },
            });

            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).called();
            verify(context.currenciesServiceMock.get('Fiat')).called();
            verify(context.currenciesServiceMock.get('T721Token')).called();
            verify(
                context.datesServiceMock.create(deepEqual(dates[0])),
            ).called();
            verify(
                context.datesServiceMock.create(deepEqual(dates[1])),
            ).called();
            verify(context.eventsServiceMock.create(deepEqual(event))).called();
            verify(
                context.vaultereumServiceMock.write(
                    `ethereum/accounts/event-${eventId.toLowerCase()}`,
                ),
            ).called();
            verify(
                context.eventsServiceMock.update(
                    deepEqual({
                        id: eventId,
                    }),
                    deepEqual({
                        address: toAcceptedAddressFormat(eventAddress),
                    }),
                ),
            ).called();
            verify(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).called();
        });

        it('error while fetching actionset', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
            } as any) as UserDto;
            const actionSetId = '64f35afc-8e13-4f80-b9e6-00a6ef52a75d';
            const actionSet: ActionSetEntity = {
                id: actionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@events/textMetadata',
                        data:
                            '{"name":"Justice Woman WorldWide 2020","description":"Justice Concert","tags":["french","electro","disco"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/modulesConfiguration',
                        data: '{}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data:
                            '{"dates":[{"name":"La Cigale","eventBegin":"2020-02-20T09:02:57.492Z","eventEnd":"2020-02-21T09:02:57.492Z","location":{"label":"120 Boulevard de Rochechouart, 75018 Paris","lat":48.882301,"lon":2.34015},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}},{"name":"Bataclan","eventBegin":"2020-02-23T09:02:57.492Z","eventEnd":"2020-02-24T09:02:57.492Z","location":{"label":"50 Boulevard Voltaire, 75011 Paris","lat":48.86311,"lon":2.37087},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}}]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/categoriesConfiguration',
                        data:
                            '{"global":[{"name":"vip_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":100,"currencies":[{"currency":"Fiat","price":"100"}]}],"dates":[[{"name":"regular_0_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}],[{"name":"regular_1_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}]]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/imagesMetadata',
                        data:
                            '{"avatar":"e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb","banners":["decdea0b-2d00-4d57-b100-955f7ba41412","531d71c9-ee88-4989-8925-ed8be8a7f918"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/adminsConfiguration',
                        data: '{"admins":[]}',
                        type: 'input',
                        error: null,
                    },
                ],
                created_at: new Date('2020-02-19T09:02:57.553Z'),
                current_action: 5,
                current_status: 'complete',
                dispatched_at: new Date('2020-02-19T09:02:57.547Z'),
                name: '@events/creation',
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                updated_at: new Date('2020-02-19T09:03:02.999Z'),
            };
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: ('2020-02-20T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-21T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: ('2020-02-23T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-24T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            const eventAddress = '0x30199ec7ad0622c159cda3409a1f22a6dfe61de9';

            const vaultereumAddressResponse = {
                request_id: '30996fb5-3e85-0964-3c84-47f633396fb3',
                lease_id: '',
                renewable: false,
                lease_duration: 0,
                data: {
                    address: eventAddress,
                    blacklist: null,
                    spending_limit_total: '0',
                    spending_limit_tx: '0',
                    total_spend: '0',
                    whitelist: null,
                },
                wrap_info: null,
                warnings: null,
                auth: null,
            };

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.eventsController.build(
                    {
                        completedActionSet: actionSetId,
                    },
                    user,
                ),
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
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();
        });

        it('no actionset found', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
            } as any) as UserDto;
            const actionSetId = '64f35afc-8e13-4f80-b9e6-00a6ef52a75d';
            const actionSet: ActionSetEntity = {
                id: actionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@events/textMetadata',
                        data:
                            '{"name":"Justice Woman WorldWide 2020","description":"Justice Concert","tags":["french","electro","disco"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/modulesConfiguration',
                        data: '{}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data:
                            '{"dates":[{"name":"La Cigale","eventBegin":"2020-02-20T09:02:57.492Z","eventEnd":"2020-02-21T09:02:57.492Z","location":{"label":"120 Boulevard de Rochechouart, 75018 Paris","lat":48.882301,"lon":2.34015},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}},{"name":"Bataclan","eventBegin":"2020-02-23T09:02:57.492Z","eventEnd":"2020-02-24T09:02:57.492Z","location":{"label":"50 Boulevard Voltaire, 75011 Paris","lat":48.86311,"lon":2.37087},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}}]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/categoriesConfiguration',
                        data:
                            '{"global":[{"name":"vip_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":100,"currencies":[{"currency":"Fiat","price":"100"}]}],"dates":[[{"name":"regular_0_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}],[{"name":"regular_1_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}]]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/imagesMetadata',
                        data:
                            '{"avatar":"e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb","banners":["decdea0b-2d00-4d57-b100-955f7ba41412","531d71c9-ee88-4989-8925-ed8be8a7f918"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/adminsConfiguration',
                        data: '{"admins":[]}',
                        type: 'input',
                        error: null,
                    },
                ],
                created_at: new Date('2020-02-19T09:02:57.553Z'),
                current_action: 5,
                current_status: 'complete',
                dispatched_at: new Date('2020-02-19T09:02:57.547Z'),
                name: '@events/creation',
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                updated_at: new Date('2020-02-19T09:03:02.999Z'),
            };
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: ('2020-02-20T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-21T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: ('2020-02-23T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-24T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            const eventAddress = '0x30199ec7ad0622c159cda3409a1f22a6dfe61de9';

            const vaultereumAddressResponse = {
                request_id: '30996fb5-3e85-0964-3c84-47f633396fb3',
                lease_id: '',
                renewable: false,
                lease_duration: 0,
                data: {
                    address: eventAddress,
                    blacklist: null,
                    spending_limit_total: '0',
                    spending_limit_tx: '0',
                    total_spend: '0',
                    whitelist: null,
                },
                wrap_info: null,
                warnings: null,
                auth: null,
            };

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            await expect(
                context.eventsController.build(
                    {
                        completedActionSet: actionSetId,
                    },
                    user,
                ),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.NotFound,
                    message: 'actionset_not_found',
                },
                status: StatusCodes.NotFound,
                message: {
                    status: StatusCodes.NotFound,
                    message: 'actionset_not_found',
                },
            });

            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();
        });

        it('actionset not complete', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
            } as any) as UserDto;
            const actionSetId = '64f35afc-8e13-4f80-b9e6-00a6ef52a75d';
            const actionSet: ActionSetEntity = {
                id: actionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@events/textMetadata',
                        data:
                            '{"name":"Justice Woman WorldWide 2020","description":"Justice Concert","tags":["french","electro","disco"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/modulesConfiguration',
                        data: '{}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data:
                            '{"dates":[{"name":"La Cigale","eventBegin":"2020-02-20T09:02:57.492Z","eventEnd":"2020-02-21T09:02:57.492Z","location":{"label":"120 Boulevard de Rochechouart, 75018 Paris","lat":48.882301,"lon":2.34015},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}},{"name":"Bataclan","eventBegin":"2020-02-23T09:02:57.492Z","eventEnd":"2020-02-24T09:02:57.492Z","location":{"label":"50 Boulevard Voltaire, 75011 Paris","lat":48.86311,"lon":2.37087},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}}]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/categoriesConfiguration',
                        data:
                            '{"global":[{"name":"vip_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":100,"currencies":[{"currency":"Fiat","price":"100"}]}],"dates":[[{"name":"regular_0_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}],[{"name":"regular_1_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}]]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/imagesMetadata',
                        data:
                            '{"avatar":"e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb","banners":["decdea0b-2d00-4d57-b100-955f7ba41412","531d71c9-ee88-4989-8925-ed8be8a7f918"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/adminsConfiguration',
                        data: '{"admins":[]}',
                        type: 'input',
                        error: null,
                    },
                ],
                created_at: new Date('2020-02-19T09:02:57.553Z'),
                current_action: 5,
                current_status: 'error',
                dispatched_at: new Date('2020-02-19T09:02:57.547Z'),
                name: '@events/creation',
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                updated_at: new Date('2020-02-19T09:03:02.999Z'),
            };
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: ('2020-02-20T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-21T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: ('2020-02-23T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-24T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            const eventAddress = '0x30199ec7ad0622c159cda3409a1f22a6dfe61de9';

            const vaultereumAddressResponse = {
                request_id: '30996fb5-3e85-0964-3c84-47f633396fb3',
                lease_id: '',
                renewable: false,
                lease_duration: 0,
                data: {
                    address: eventAddress,
                    blacklist: null,
                    spending_limit_total: '0',
                    spending_limit_tx: '0',
                    total_spend: '0',
                    whitelist: null,
                },
                wrap_info: null,
                warnings: null,
                auth: null,
            };

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [actionSet],
            });

            await expect(
                context.eventsController.build(
                    {
                        completedActionSet: actionSetId,
                    },
                    user,
                ),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.BadRequest,
                    message: 'incomplete_action_set',
                },
                status: StatusCodes.BadRequest,
                message: {
                    status: StatusCodes.BadRequest,
                    message: 'incomplete_action_set',
                },
            });

            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();
        });

        it('unauthorized user', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a386',
            } as any) as UserDto;
            const actionSetId = '64f35afc-8e13-4f80-b9e6-00a6ef52a75d';
            const actionSet: ActionSetEntity = {
                id: actionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@events/textMetadata',
                        data:
                            '{"name":"Justice Woman WorldWide 2020","description":"Justice Concert","tags":["french","electro","disco"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/modulesConfiguration',
                        data: '{}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data:
                            '{"dates":[{"name":"La Cigale","eventBegin":"2020-02-20T09:02:57.492Z","eventEnd":"2020-02-21T09:02:57.492Z","location":{"label":"120 Boulevard de Rochechouart, 75018 Paris","lat":48.882301,"lon":2.34015},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}},{"name":"Bataclan","eventBegin":"2020-02-23T09:02:57.492Z","eventEnd":"2020-02-24T09:02:57.492Z","location":{"label":"50 Boulevard Voltaire, 75011 Paris","lat":48.86311,"lon":2.37087},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}}]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/categoriesConfiguration',
                        data:
                            '{"global":[{"name":"vip_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":100,"currencies":[{"currency":"Fiat","price":"100"}]}],"dates":[[{"name":"regular_0_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}],[{"name":"regular_1_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}]]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/imagesMetadata',
                        data:
                            '{"avatar":"e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb","banners":["decdea0b-2d00-4d57-b100-955f7ba41412","531d71c9-ee88-4989-8925-ed8be8a7f918"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/adminsConfiguration',
                        data: '{"admins":[]}',
                        type: 'input',
                        error: null,
                    },
                ],
                created_at: new Date('2020-02-19T09:02:57.553Z'),
                current_action: 5,
                current_status: 'complete',
                dispatched_at: new Date('2020-02-19T09:02:57.547Z'),
                name: '@events/creation',
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                updated_at: new Date('2020-02-19T09:03:02.999Z'),
            };
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: ('2020-02-20T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-21T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: ('2020-02-23T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-24T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            const eventAddress = '0x30199ec7ad0622c159cda3409a1f22a6dfe61de9';

            const vaultereumAddressResponse = {
                request_id: '30996fb5-3e85-0964-3c84-47f633396fb3',
                lease_id: '',
                renewable: false,
                lease_duration: 0,
                data: {
                    address: eventAddress,
                    blacklist: null,
                    spending_limit_total: '0',
                    spending_limit_tx: '0',
                    total_spend: '0',
                    whitelist: null,
                },
                wrap_info: null,
                warnings: null,
                auth: null,
            };

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [actionSet],
            });

            await expect(
                context.eventsController.build(
                    {
                        completedActionSet: actionSetId,
                    },
                    user,
                ),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.Unauthorized,
                    message: 'not_actionset_owner',
                },
                status: StatusCodes.Unauthorized,
                message: {
                    status: StatusCodes.Unauthorized,
                    message: 'not_actionset_owner',
                },
            });

            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();
        });

        it('date creation fail', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
            } as any) as UserDto;
            const actionSetId = '64f35afc-8e13-4f80-b9e6-00a6ef52a75d';
            const actionSet: ActionSetEntity = {
                id: actionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@events/textMetadata',
                        data:
                            '{"name":"Justice Woman WorldWide 2020","description":"Justice Concert","tags":["french","electro","disco"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/modulesConfiguration',
                        data: '{}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data:
                            '{"dates":[{"name":"La Cigale","eventBegin":"2020-02-20T09:02:57.492Z","eventEnd":"2020-02-21T09:02:57.492Z","location":{"label":"120 Boulevard de Rochechouart, 75018 Paris","lat":48.882301,"lon":2.34015},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}},{"name":"Bataclan","eventBegin":"2020-02-23T09:02:57.492Z","eventEnd":"2020-02-24T09:02:57.492Z","location":{"label":"50 Boulevard Voltaire, 75011 Paris","lat":48.86311,"lon":2.37087},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}}]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/categoriesConfiguration',
                        data:
                            '{"global":[{"name":"vip_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":100,"currencies":[{"currency":"Fiat","price":"100"}]}],"dates":[[{"name":"regular_0_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}],[{"name":"regular_1_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}]]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/imagesMetadata',
                        data:
                            '{"avatar":"e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb","banners":["decdea0b-2d00-4d57-b100-955f7ba41412","531d71c9-ee88-4989-8925-ed8be8a7f918"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/adminsConfiguration',
                        data: '{"admins":[]}',
                        type: 'input',
                        error: null,
                    },
                ],
                created_at: new Date('2020-02-19T09:02:57.553Z'),
                current_action: 5,
                current_status: 'complete',
                dispatched_at: new Date('2020-02-19T09:02:57.547Z'),
                name: '@events/creation',
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                updated_at: new Date('2020-02-19T09:03:02.999Z'),
            };
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: ('2020-02-20T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-21T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: ('2020-02-23T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-24T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            const eventAddress = '0x30199ec7ad0622c159cda3409a1f22a6dfe61de9';

            const vaultereumAddressResponse = {
                request_id: '30996fb5-3e85-0964-3c84-47f633396fb3',
                lease_id: '',
                renewable: false,
                lease_duration: 0,
                data: {
                    address: eventAddress,
                    blacklist: null,
                    spending_limit_total: '0',
                    spending_limit_tx: '0',
                    total_spend: '0',
                    whitelist: null,
                },
                wrap_info: null,
                warnings: null,
                auth: null,
            };

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [actionSet],
            });

            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(
                'ticket721_0',
            );

            when(context.currenciesServiceMock.get('Fiat')).thenResolve({
                type: 'set',
                name: 'Fiat',
                dollarPeg: 1,
                contains: ['T721Token'],
            });
            when(context.currenciesServiceMock.get('T721Token')).thenResolve({
                type: 'erc20',
                name: 'T721Token',
                module: 't721token',
                address: '0x813a9CDaa69b617baA5F220686670B42c6Af9EdD',
                dollarPeg: 1,
                controller: ({} as any) as ContractsControllerBase,
            });

            when(
                context.datesServiceMock.create(deepEqual(dates[0])),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.eventsController.build(
                    {
                        completedActionSet: actionSetId,
                    },
                    user,
                ),
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
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).called();
            verify(context.currenciesServiceMock.get('Fiat')).called();
            verify(context.currenciesServiceMock.get('T721Token')).called();
            verify(
                context.datesServiceMock.create(deepEqual(dates[0])),
            ).called();
        });

        it('event creation fail', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
            } as any) as UserDto;
            const actionSetId = '64f35afc-8e13-4f80-b9e6-00a6ef52a75d';
            const actionSet: ActionSetEntity = {
                id: actionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@events/textMetadata',
                        data:
                            '{"name":"Justice Woman WorldWide 2020","description":"Justice Concert","tags":["french","electro","disco"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/modulesConfiguration',
                        data: '{}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data:
                            '{"dates":[{"name":"La Cigale","eventBegin":"2020-02-20T09:02:57.492Z","eventEnd":"2020-02-21T09:02:57.492Z","location":{"label":"120 Boulevard de Rochechouart, 75018 Paris","lat":48.882301,"lon":2.34015},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}},{"name":"Bataclan","eventBegin":"2020-02-23T09:02:57.492Z","eventEnd":"2020-02-24T09:02:57.492Z","location":{"label":"50 Boulevard Voltaire, 75011 Paris","lat":48.86311,"lon":2.37087},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}}]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/categoriesConfiguration',
                        data:
                            '{"global":[{"name":"vip_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":100,"currencies":[{"currency":"Fiat","price":"100"}]}],"dates":[[{"name":"regular_0_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}],[{"name":"regular_1_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}]]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/imagesMetadata',
                        data:
                            '{"avatar":"e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb","banners":["decdea0b-2d00-4d57-b100-955f7ba41412","531d71c9-ee88-4989-8925-ed8be8a7f918"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/adminsConfiguration',
                        data: '{"admins":[]}',
                        type: 'input',
                        error: null,
                    },
                ],
                created_at: new Date('2020-02-19T09:02:57.553Z'),
                current_action: 5,
                current_status: 'complete',
                dispatched_at: new Date('2020-02-19T09:02:57.547Z'),
                name: '@events/creation',
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                updated_at: new Date('2020-02-19T09:03:02.999Z'),
            };
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: ('2020-02-20T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-21T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: ('2020-02-23T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-24T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            const eventAddress = '0x30199ec7ad0622c159cda3409a1f22a6dfe61de9';

            const vaultereumAddressResponse = {
                request_id: '30996fb5-3e85-0964-3c84-47f633396fb3',
                lease_id: '',
                renewable: false,
                lease_duration: 0,
                data: {
                    address: eventAddress,
                    blacklist: null,
                    spending_limit_total: '0',
                    spending_limit_tx: '0',
                    total_spend: '0',
                    whitelist: null,
                },
                wrap_info: null,
                warnings: null,
                auth: null,
            };

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [actionSet],
            });

            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(
                'ticket721_0',
            );

            when(context.currenciesServiceMock.get('Fiat')).thenResolve({
                type: 'set',
                name: 'Fiat',
                dollarPeg: 1,
                contains: ['T721Token'],
            });
            when(context.currenciesServiceMock.get('T721Token')).thenResolve({
                type: 'erc20',
                name: 'T721Token',
                module: 't721token',
                address: '0x813a9CDaa69b617baA5F220686670B42c6Af9EdD',
                dollarPeg: 1,
                controller: ({} as any) as ContractsControllerBase,
            });

            when(
                context.datesServiceMock.create(deepEqual(dates[0])),
            ).thenResolve({
                error: null,
                response: ({
                    ...dates[0],
                    id: dateIds[0],
                } as any) as DateEntity,
            });

            when(
                context.datesServiceMock.create(deepEqual(dates[1])),
            ).thenResolve({
                error: null,
                response: ({
                    ...dates[1],
                    id: dateIds[1],
                } as any) as DateEntity,
            });

            when(
                context.eventsServiceMock.create(deepEqual(event)),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.eventsController.build(
                    {
                        completedActionSet: actionSetId,
                    },
                    user,
                ),
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
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).called();
            verify(context.currenciesServiceMock.get('Fiat')).called();
            verify(context.currenciesServiceMock.get('T721Token')).called();
            verify(
                context.datesServiceMock.create(deepEqual(dates[0])),
            ).called();
            verify(
                context.datesServiceMock.create(deepEqual(dates[1])),
            ).called();
            verify(context.eventsServiceMock.create(deepEqual(event))).called();
        });

        it('vaultereum account creation', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
            } as any) as UserDto;
            const actionSetId = '64f35afc-8e13-4f80-b9e6-00a6ef52a75d';
            const actionSet: ActionSetEntity = {
                id: actionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@events/textMetadata',
                        data:
                            '{"name":"Justice Woman WorldWide 2020","description":"Justice Concert","tags":["french","electro","disco"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/modulesConfiguration',
                        data: '{}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data:
                            '{"dates":[{"name":"La Cigale","eventBegin":"2020-02-20T09:02:57.492Z","eventEnd":"2020-02-21T09:02:57.492Z","location":{"label":"120 Boulevard de Rochechouart, 75018 Paris","lat":48.882301,"lon":2.34015},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}},{"name":"Bataclan","eventBegin":"2020-02-23T09:02:57.492Z","eventEnd":"2020-02-24T09:02:57.492Z","location":{"label":"50 Boulevard Voltaire, 75011 Paris","lat":48.86311,"lon":2.37087},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}}]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/categoriesConfiguration',
                        data:
                            '{"global":[{"name":"vip_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":100,"currencies":[{"currency":"Fiat","price":"100"}]}],"dates":[[{"name":"regular_0_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}],[{"name":"regular_1_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}]]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/imagesMetadata',
                        data:
                            '{"avatar":"e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb","banners":["decdea0b-2d00-4d57-b100-955f7ba41412","531d71c9-ee88-4989-8925-ed8be8a7f918"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/adminsConfiguration',
                        data: '{"admins":[]}',
                        type: 'input',
                        error: null,
                    },
                ],
                created_at: new Date('2020-02-19T09:02:57.553Z'),
                current_action: 5,
                current_status: 'complete',
                dispatched_at: new Date('2020-02-19T09:02:57.547Z'),
                name: '@events/creation',
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                updated_at: new Date('2020-02-19T09:03:02.999Z'),
            };
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: ('2020-02-20T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-21T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: ('2020-02-23T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-24T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            const eventAddress = '0x30199ec7ad0622c159cda3409a1f22a6dfe61de9';

            const vaultereumAddressResponse = {
                request_id: '30996fb5-3e85-0964-3c84-47f633396fb3',
                lease_id: '',
                renewable: false,
                lease_duration: 0,
                data: {
                    address: eventAddress,
                    blacklist: null,
                    spending_limit_total: '0',
                    spending_limit_tx: '0',
                    total_spend: '0',
                    whitelist: null,
                },
                wrap_info: null,
                warnings: null,
                auth: null,
            };

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [actionSet],
            });

            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(
                'ticket721_0',
            );

            when(context.currenciesServiceMock.get('Fiat')).thenResolve({
                type: 'set',
                name: 'Fiat',
                dollarPeg: 1,
                contains: ['T721Token'],
            });
            when(context.currenciesServiceMock.get('T721Token')).thenResolve({
                type: 'erc20',
                name: 'T721Token',
                module: 't721token',
                address: '0x813a9CDaa69b617baA5F220686670B42c6Af9EdD',
                dollarPeg: 1,
                controller: ({} as any) as ContractsControllerBase,
            });

            when(
                context.datesServiceMock.create(deepEqual(dates[0])),
            ).thenResolve({
                error: null,
                response: ({
                    ...dates[0],
                    id: dateIds[0],
                } as any) as DateEntity,
            });

            when(
                context.datesServiceMock.create(deepEqual(dates[1])),
            ).thenResolve({
                error: null,
                response: ({
                    ...dates[1],
                    id: dateIds[1],
                } as any) as DateEntity,
            });

            when(
                context.eventsServiceMock.create(deepEqual(event)),
            ).thenResolve({
                error: null,
                response: ({
                    ...event,
                    id: eventId,
                } as any) as EventEntity,
            });

            when(
                context.vaultereumServiceMock.write(
                    `ethereum/accounts/event-${eventId.toLowerCase()}`,
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.eventsController.build(
                    {
                        completedActionSet: actionSetId,
                    },
                    user,
                ),
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
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).called();
            verify(context.currenciesServiceMock.get('Fiat')).called();
            verify(context.currenciesServiceMock.get('T721Token')).called();
            verify(
                context.datesServiceMock.create(deepEqual(dates[0])),
            ).called();
            verify(
                context.datesServiceMock.create(deepEqual(dates[1])),
            ).called();
            verify(context.eventsServiceMock.create(deepEqual(event))).called();
            verify(
                context.vaultereumServiceMock.write(
                    `ethereum/accounts/event-${eventId.toLowerCase()}`,
                ),
            ).called();
        });

        it('event entity conversion error', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
            } as any) as UserDto;
            const actionSetId = '64f35afc-8e13-4f80-b9e6-00a6ef52a75d';
            const actionSet: ActionSetEntity = {
                id: actionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@events/textMetadata',
                        data:
                            '{"name":"Justice Woman WorldWide 2020","description":"Justice Concert","tags":["french","electro","disco"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/modulesConfiguration',
                        data: '{}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data:
                            '{"dates":[{"name":"La Cigale","eventBegin":"2020-02-20T09:02:57.492Z","eventEnd":"2020-02-21T09:02:57.492Z","location":{"label":"120 Boulevard de Rochechouart, 75018 Paris","lat":48.882301,"lon":2.34015},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}},{"name":"Bataclan","eventBegin":"2020-02-23T09:02:57.492Z","eventEnd":"2020-02-24T09:02:57.492Z","location":{"label":"50 Boulevard Voltaire, 75011 Paris","lat":48.86311,"lon":2.37087},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}}]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/categoriesConfiguration',
                        data:
                            '{"global":[{"name":"vip_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":100,"currencies":[{"currency":"Fiat","price":"100"}]}],"dates":[[{"name":"regular_0_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}],[{"name":"regular_1_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}]]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/imagesMetadata',
                        data:
                            '{"avatar":"e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb","banners":["decdea0b-2d00-4d57-b100-955f7ba41412","531d71c9-ee88-4989-8925-ed8be8a7f918"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/adminsConfiguration',
                        data: '{"admins":[]}',
                        type: 'input',
                        error: null,
                    },
                ],
                created_at: new Date('2020-02-19T09:02:57.553Z'),
                current_action: 5,
                current_status: 'complete',
                dispatched_at: new Date('2020-02-19T09:02:57.547Z'),
                name: '@events/creation',
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                updated_at: new Date('2020-02-19T09:03:02.999Z'),
            };
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: ('2020-02-20T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-21T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: ('2020-02-23T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-24T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            const eventAddress = '0x30199ec7ad0622c159cda3409a1f22a6dfe61de9';

            const vaultereumAddressResponse = {
                request_id: '30996fb5-3e85-0964-3c84-47f633396fb3',
                lease_id: '',
                renewable: false,
                lease_duration: 0,
                data: {
                    address: eventAddress,
                    blacklist: null,
                    spending_limit_total: '0',
                    spending_limit_tx: '0',
                    total_spend: '0',
                    whitelist: null,
                },
                wrap_info: null,
                warnings: null,
                auth: null,
            };

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [actionSet],
            });

            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(
                'ticket721_0',
            );

            when(context.currenciesServiceMock.get('Fiat')).thenResolve(
                undefined,
            );

            await expect(
                context.eventsController.build(
                    {
                        completedActionSet: actionSetId,
                    },
                    user,
                ),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.InternalServerError,
                    message: 'entity_conversion_fail',
                },
                status: StatusCodes.InternalServerError,
                message: {
                    status: StatusCodes.InternalServerError,
                    message: 'entity_conversion_fail',
                },
            });

            verify(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).called();
            verify(context.currenciesServiceMock.get('Fiat')).called();
        });

        it('event address update fail', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
            } as any) as UserDto;
            const actionSetId = '64f35afc-8e13-4f80-b9e6-00a6ef52a75d';
            const actionSet: ActionSetEntity = {
                id: actionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@events/textMetadata',
                        data:
                            '{"name":"Justice Woman WorldWide 2020","description":"Justice Concert","tags":["french","electro","disco"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/modulesConfiguration',
                        data: '{}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data:
                            '{"dates":[{"name":"La Cigale","eventBegin":"2020-02-20T09:02:57.492Z","eventEnd":"2020-02-21T09:02:57.492Z","location":{"label":"120 Boulevard de Rochechouart, 75018 Paris","lat":48.882301,"lon":2.34015},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}},{"name":"Bataclan","eventBegin":"2020-02-23T09:02:57.492Z","eventEnd":"2020-02-24T09:02:57.492Z","location":{"label":"50 Boulevard Voltaire, 75011 Paris","lat":48.86311,"lon":2.37087},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}}]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/categoriesConfiguration',
                        data:
                            '{"global":[{"name":"vip_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":100,"currencies":[{"currency":"Fiat","price":"100"}]}],"dates":[[{"name":"regular_0_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}],[{"name":"regular_1_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}]]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/imagesMetadata',
                        data:
                            '{"avatar":"e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb","banners":["decdea0b-2d00-4d57-b100-955f7ba41412","531d71c9-ee88-4989-8925-ed8be8a7f918"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/adminsConfiguration',
                        data: '{"admins":[]}',
                        type: 'input',
                        error: null,
                    },
                ],
                created_at: new Date('2020-02-19T09:02:57.553Z'),
                current_action: 5,
                current_status: 'complete',
                dispatched_at: new Date('2020-02-19T09:02:57.547Z'),
                name: '@events/creation',
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                updated_at: new Date('2020-02-19T09:03:02.999Z'),
            };
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: ('2020-02-20T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-21T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: ('2020-02-23T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-24T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            const eventAddress = '0x30199ec7ad0622c159cda3409a1f22a6dfe61de9';

            const vaultereumAddressResponse = {
                request_id: '30996fb5-3e85-0964-3c84-47f633396fb3',
                lease_id: '',
                renewable: false,
                lease_duration: 0,
                data: {
                    address: eventAddress,
                    blacklist: null,
                    spending_limit_total: '0',
                    spending_limit_tx: '0',
                    total_spend: '0',
                    whitelist: null,
                },
                wrap_info: null,
                warnings: null,
                auth: null,
            };

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [actionSet],
            });

            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(
                'ticket721_0',
            );

            when(context.currenciesServiceMock.get('Fiat')).thenResolve({
                type: 'set',
                name: 'Fiat',
                dollarPeg: 1,
                contains: ['T721Token'],
            });
            when(context.currenciesServiceMock.get('T721Token')).thenResolve({
                type: 'erc20',
                name: 'T721Token',
                module: 't721token',
                address: '0x813a9CDaa69b617baA5F220686670B42c6Af9EdD',
                dollarPeg: 1,
                controller: ({} as any) as ContractsControllerBase,
            });

            when(
                context.datesServiceMock.create(deepEqual(dates[0])),
            ).thenResolve({
                error: null,
                response: ({
                    ...dates[0],
                    id: dateIds[0],
                } as any) as DateEntity,
            });

            when(
                context.datesServiceMock.create(deepEqual(dates[1])),
            ).thenResolve({
                error: null,
                response: ({
                    ...dates[1],
                    id: dateIds[1],
                } as any) as DateEntity,
            });

            when(
                context.eventsServiceMock.create(deepEqual(event)),
            ).thenResolve({
                error: null,
                response: ({
                    ...event,
                    id: eventId,
                } as any) as EventEntity,
            });

            when(
                context.vaultereumServiceMock.write(
                    `ethereum/accounts/event-${eventId.toLowerCase()}`,
                ),
            ).thenResolve({
                error: null,
                response: vaultereumAddressResponse,
            });

            when(
                context.eventsServiceMock.update(
                    deepEqual({
                        id: eventId,
                    }),
                    deepEqual({
                        address: toAcceptedAddressFormat(eventAddress),
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.eventsController.build(
                    {
                        completedActionSet: actionSetId,
                    },
                    user,
                ),
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
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).called();
            verify(context.currenciesServiceMock.get('Fiat')).called();
            verify(context.currenciesServiceMock.get('T721Token')).called();
            verify(
                context.datesServiceMock.create(deepEqual(dates[0])),
            ).called();
            verify(
                context.datesServiceMock.create(deepEqual(dates[1])),
            ).called();
            verify(context.eventsServiceMock.create(deepEqual(event))).called();
            verify(
                context.vaultereumServiceMock.write(
                    `ethereum/accounts/event-${eventId.toLowerCase()}`,
                ),
            ).called();
            verify(
                context.eventsServiceMock.update(
                    deepEqual({
                        id: eventId,
                    }),
                    deepEqual({
                        address: toAcceptedAddressFormat(eventAddress),
                    }),
                ),
            ).called();
        });

        it('final event fetch error', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
            } as any) as UserDto;
            const actionSetId = '64f35afc-8e13-4f80-b9e6-00a6ef52a75d';
            const actionSet: ActionSetEntity = {
                id: actionSetId,
                actions: [
                    {
                        status: 'complete',
                        name: '@events/textMetadata',
                        data:
                            '{"name":"Justice Woman WorldWide 2020","description":"Justice Concert","tags":["french","electro","disco"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/modulesConfiguration',
                        data: '{}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data:
                            '{"dates":[{"name":"La Cigale","eventBegin":"2020-02-20T09:02:57.492Z","eventEnd":"2020-02-21T09:02:57.492Z","location":{"label":"120 Boulevard de Rochechouart, 75018 Paris","lat":48.882301,"lon":2.34015},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}},{"name":"Bataclan","eventBegin":"2020-02-23T09:02:57.492Z","eventEnd":"2020-02-24T09:02:57.492Z","location":{"label":"50 Boulevard Voltaire, 75011 Paris","lat":48.86311,"lon":2.37087},"city":{"name":"Paris","nameAscii":"Paris","nameAdmin":"Île-de-France","country":"France","coord":{"lat":48.8667,"lon":2.3333},"population":9904000,"id":1250015082}}]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/categoriesConfiguration',
                        data:
                            '{"global":[{"name":"vip_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":100,"currencies":[{"currency":"Fiat","price":"100"}]}],"dates":[[{"name":"regular_0_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}],[{"name":"regular_1_0","saleBegin":"2020-02-19T10:02:57.492Z","saleEnd":"2020-02-20T08:02:57.492Z","resaleBegin":"2020-02-19T10:02:57.492Z","resaleEnd":"2020-02-20T08:02:57.492Z","seats":200,"currencies":[{"currency":"Fiat","price":"100"}]}]]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/imagesMetadata',
                        data:
                            '{"avatar":"e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb","banners":["decdea0b-2d00-4d57-b100-955f7ba41412","531d71c9-ee88-4989-8925-ed8be8a7f918"]}',
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/adminsConfiguration',
                        data: '{"admins":[]}',
                        type: 'input',
                        error: null,
                    },
                ],
                created_at: new Date('2020-02-19T09:02:57.553Z'),
                current_action: 5,
                current_status: 'complete',
                dispatched_at: new Date('2020-02-19T09:02:57.547Z'),
                name: '@events/creation',
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                updated_at: new Date('2020-02-19T09:03:02.999Z'),
            };
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: ('2020-02-20T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-21T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: ('2020-02-23T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-24T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            const eventAddress = '0x30199ec7ad0622c159cda3409a1f22a6dfe61de9';

            const vaultereumAddressResponse = {
                request_id: '30996fb5-3e85-0964-3c84-47f633396fb3',
                lease_id: '',
                renewable: false,
                lease_duration: 0,
                data: {
                    address: eventAddress,
                    blacklist: null,
                    spending_limit_total: '0',
                    spending_limit_tx: '0',
                    total_spend: '0',
                    whitelist: null,
                },
                wrap_info: null,
                warnings: null,
                auth: null,
            };

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [actionSet],
            });

            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(
                'ticket721_0',
            );

            when(context.currenciesServiceMock.get('Fiat')).thenResolve({
                type: 'set',
                name: 'Fiat',
                dollarPeg: 1,
                contains: ['T721Token'],
            });
            when(context.currenciesServiceMock.get('T721Token')).thenResolve({
                type: 'erc20',
                name: 'T721Token',
                module: 't721token',
                address: '0x813a9CDaa69b617baA5F220686670B42c6Af9EdD',
                dollarPeg: 1,
                controller: ({} as any) as ContractsControllerBase,
            });

            when(
                context.datesServiceMock.create(deepEqual(dates[0])),
            ).thenResolve({
                error: null,
                response: ({
                    ...dates[0],
                    id: dateIds[0],
                } as any) as DateEntity,
            });

            when(
                context.datesServiceMock.create(deepEqual(dates[1])),
            ).thenResolve({
                error: null,
                response: ({
                    ...dates[1],
                    id: dateIds[1],
                } as any) as DateEntity,
            });

            when(
                context.eventsServiceMock.create(deepEqual(event)),
            ).thenResolve({
                error: null,
                response: ({
                    ...event,
                    id: eventId,
                } as any) as EventEntity,
            });

            when(
                context.vaultereumServiceMock.write(
                    `ethereum/accounts/event-${eventId.toLowerCase()}`,
                ),
            ).thenResolve({
                error: null,
                response: vaultereumAddressResponse,
            });

            when(
                context.eventsServiceMock.update(
                    deepEqual({
                        id: eventId,
                    }),
                    deepEqual({
                        address: toAcceptedAddressFormat(eventAddress),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.eventsController.build(
                    {
                        completedActionSet: actionSetId,
                    },
                    user,
                ),
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
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).called();
            verify(context.currenciesServiceMock.get('Fiat')).called();
            verify(context.currenciesServiceMock.get('T721Token')).called();
            verify(
                context.datesServiceMock.create(deepEqual(dates[0])),
            ).called();
            verify(
                context.datesServiceMock.create(deepEqual(dates[1])),
            ).called();
            verify(context.eventsServiceMock.create(deepEqual(event))).called();
            verify(
                context.vaultereumServiceMock.write(
                    `ethereum/accounts/event-${eventId.toLowerCase()}`,
                ),
            ).called();
            verify(
                context.eventsServiceMock.update(
                    deepEqual({
                        id: eventId,
                    }),
                    deepEqual({
                        address: toAcceptedAddressFormat(eventAddress),
                    }),
                ),
            ).called();
            verify(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).called();
        });
    });

    describe('genPayload', function() {
        it('should generate the payload to sign', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                address: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
            } as any) as UserDto;
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: new Date('2020-02-20T09:02:57.492Z'),
                    event_end: new Date('2020-02-21T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: new Date('2020-02-23T09:02:57.492Z'),
                    event_end: new Date('2020-02-24T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                id: eventId,
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        sale_end: new Date('2020-02-20T08:02:57.492Z'),
                        resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        resale_end: new Date('2020-02-20T08:02:57.492Z'),
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [(event as any) as EventEntity],
            });

            const t721caddress = '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2';
            const t721aaddress = '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2';

            const subcontext: {
                metaMarketplaceMock: ContractsControllerBase;
                t721controllerMock: ContractsControllerBase;
            } = {
                metaMarketplaceMock: mock(ContractsControllerBase),
                t721controllerMock: mock(ContractsControllerBase),
            };

            const t721aInstance = {
                _address: t721aaddress,
                methods: {},
            };
            const t721cInstance = {
                _address: t721caddress,
                methods: {
                    createGroup: (name: string) => ({
                        encodeABI: () => '0xabcd',
                    }),
                    getNextGroupId: (addr: string) => ({
                        call: async () => toB32('this is an ID'),
                    }),
                    registerCategories: () => ({
                        encodeABI: () => '0xabcd',
                    }),
                },
            };

            when(subcontext.t721controllerMock.get()).thenResolve(
                t721cInstance,
            );
            when(context.t721AdminServiceMock.get()).thenResolve(t721aInstance);

            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(
                'ticket721_0',
            );
            when(
                context.configServiceMock.get('ETHEREUM_NODE_NETWORK_ID'),
            ).thenReturn('2702');
            when(
                context.configServiceMock.get('ETHEREUM_MTX_DOMAIN_NAME'),
            ).thenReturn('Refract Wallet');
            when(
                context.configServiceMock.get('ETHEREUM_MTX_VERSION'),
            ).thenReturn('0');

            when(
                context.ticketforgeServiceMock.getScopeContracts('ticket721_0'),
            ).thenReturn({
                mm: instance(subcontext.metaMarketplaceMock),
                t721c: instance(subcontext.t721controllerMock),
            });

            when(
                context.datesServiceMock.search(
                    deepEqual({
                        id: dateIds[0],
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    ({
                        ...dates[0],
                        id: dates[0].id,
                    } as any) as DateEntity,
                ],
            });

            when(
                context.datesServiceMock.search(
                    deepEqual({
                        id: dateIds[1],
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    ({
                        ...dates[1],
                        id: dates[1].id,
                    } as any) as DateEntity,
                ],
            });

            when(context.currenciesServiceMock.get('T721Token')).thenResolve({
                type: 'erc20',
                name: 'T721Token',
                module: 't721token',
                address: '0x813a9CDaa69b617baA5F220686670B42c6Af9EdD',
                dollarPeg: 1,
                controller: ({} as any) as ContractsControllerBase,
            });

            when(
                context.refractFactoryServiceMock.getNonce(user.address),
            ).thenResolve(1);

            const res = await context.eventsController.getPayload(
                {
                    event: eventId,
                },
                user,
            );

            expect(res).toEqual({
                payload: {
                    domain: {
                        name: 'Refract Wallet',
                        version: '0',
                        chainId: 2702,
                        verifyingContract:
                            '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                    },
                    primaryType: 'MetaTransaction',
                    types: {
                        MetaTransaction: [
                            {
                                name: 'parameters',
                                type: 'TransactionParameters[]',
                            },
                            {
                                name: 'nonce',
                                type: 'uint256',
                            },
                        ],
                        TransactionParameters: [
                            {
                                type: 'address',
                                name: 'from',
                            },
                            {
                                type: 'address',
                                name: 'to',
                            },
                            {
                                type: 'address',
                                name: 'relayer',
                            },
                            {
                                type: 'uint256',
                                name: 'value',
                            },
                            {
                                type: 'bytes',
                                name: 'data',
                            },
                        ],
                        EIP712Domain: [
                            {
                                name: 'name',
                                type: 'string',
                            },
                            {
                                name: 'version',
                                type: 'string',
                            },
                            {
                                name: 'chainId',
                                type: 'uint256',
                            },
                            {
                                name: 'verifyingContract',
                                type: 'address',
                            },
                        ],
                    },
                    message: {
                        nonce: 1,
                        parameters: [
                            {
                                from:
                                    '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                                to:
                                    '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                                relayer:
                                    '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                                data: '0xabcd',
                                value: '0',
                            },
                            {
                                from:
                                    '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                                to:
                                    '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                                relayer:
                                    '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                                data: '0xabcd',
                                value: '0',
                            },
                        ],
                    },
                },
                groupId:
                    '0x7468697320697320616e20494400000000000000000000000000000000000000',
            });

            verify(
                context.eventsServiceMock.search(deepEqual({ id: eventId })),
            ).called();
            verify(subcontext.t721controllerMock.get()).called();
            verify(context.t721AdminServiceMock.get()).called();
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).called();
            verify(
                context.configServiceMock.get('ETHEREUM_NODE_NETWORK_ID'),
            ).called();
            verify(
                context.configServiceMock.get('ETHEREUM_MTX_DOMAIN_NAME'),
            ).called();
            verify(
                context.configServiceMock.get('ETHEREUM_MTX_VERSION'),
            ).called();
            verify(
                context.ticketforgeServiceMock.getScopeContracts('ticket721_0'),
            ).called();
            verify(
                context.datesServiceMock.search(deepEqual({ id: dateIds[0] })),
            ).called();
            verify(
                context.datesServiceMock.search(deepEqual({ id: dateIds[1] })),
            ).called();
            verify(context.currenciesServiceMock.get('T721Token')).called();
            verify(
                context.refractFactoryServiceMock.getNonce(user.address),
            ).called();
        });

        it('should fail on event fetch error', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                address: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
            } as any) as UserDto;
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: new Date('2020-02-20T09:02:57.492Z'),
                    event_end: new Date('2020-02-21T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: new Date('2020-02-23T09:02:57.492Z'),
                    event_end: new Date('2020-02-24T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                id: eventId,
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        sale_end: new Date('2020-02-20T08:02:57.492Z'),
                        resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        resale_end: new Date('2020-02-20T08:02:57.492Z'),
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.eventsController.getPayload(
                    {
                        event: eventId,
                    },
                    user,
                ),
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
                context.eventsServiceMock.search(deepEqual({ id: eventId })),
            ).called();
        });

        it('should fail on event not found', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                address: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
            } as any) as UserDto;
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: new Date('2020-02-20T09:02:57.492Z'),
                    event_end: new Date('2020-02-21T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: new Date('2020-02-23T09:02:57.492Z'),
                    event_end: new Date('2020-02-24T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                id: eventId,
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        sale_end: new Date('2020-02-20T08:02:57.492Z'),
                        resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        resale_end: new Date('2020-02-20T08:02:57.492Z'),
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            await expect(
                context.eventsController.getPayload(
                    {
                        event: eventId,
                    },
                    user,
                ),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.NotFound,
                    message: 'event_not_found',
                },
                status: StatusCodes.NotFound,
                message: {
                    status: StatusCodes.NotFound,
                    message: 'event_not_found',
                },
            });

            verify(
                context.eventsServiceMock.search(deepEqual({ id: eventId })),
            ).called();
        });

        it('should fail on invalid scope fetch', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                address: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
            } as any) as UserDto;
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: new Date('2020-02-20T09:02:57.492Z'),
                    event_end: new Date('2020-02-21T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: new Date('2020-02-23T09:02:57.492Z'),
                    event_end: new Date('2020-02-24T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                id: eventId,
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        sale_end: new Date('2020-02-20T08:02:57.492Z'),
                        resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        resale_end: new Date('2020-02-20T08:02:57.492Z'),
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [(event as any) as EventEntity],
            });

            const t721caddress = '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2';
            const t721aaddress = '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2';

            const subcontext: {
                metaMarketplaceMock: ContractsControllerBase;
                t721controllerMock: ContractsControllerBase;
            } = {
                metaMarketplaceMock: mock(ContractsControllerBase),
                t721controllerMock: mock(ContractsControllerBase),
            };

            const t721aInstance = {
                _address: t721aaddress,
                methods: {},
            };
            const t721cInstance = {
                _address: t721caddress,
                methods: {
                    createGroup: (name: string) => ({
                        encodeABI: () => '0xabcd',
                    }),
                    getNextGroupId: (addr: string) => ({
                        call: async () => toB32('this is an ID'),
                    }),
                    registerCategories: () => ({
                        encodeABI: () => '0xabcd',
                    }),
                },
            };

            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(
                'ticket721_0',
            );

            when(
                context.ticketforgeServiceMock.getScopeContracts('ticket721_0'),
            ).thenReturn(null);

            await expect(
                context.eventsController.getPayload(
                    {
                        event: eventId,
                    },
                    user,
                ),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.NotFound,
                    message: 'scope_contracts_not_found',
                },
                status: StatusCodes.NotFound,
                message: {
                    status: StatusCodes.NotFound,
                    message: 'scope_contracts_not_found',
                },
            });

            verify(
                context.eventsServiceMock.search(deepEqual({ id: eventId })),
            ).called();
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).called();
            verify(
                context.ticketforgeServiceMock.getScopeContracts('ticket721_0'),
            ).called();
        });

        it('should fail on next group id fetch', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                address: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
            } as any) as UserDto;
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: new Date('2020-02-20T09:02:57.492Z'),
                    event_end: new Date('2020-02-21T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: new Date('2020-02-23T09:02:57.492Z'),
                    event_end: new Date('2020-02-24T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                id: eventId,
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        sale_end: new Date('2020-02-20T08:02:57.492Z'),
                        resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        resale_end: new Date('2020-02-20T08:02:57.492Z'),
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [(event as any) as EventEntity],
            });

            const t721caddress = '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2';
            const t721aaddress = '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2';

            const subcontext: {
                metaMarketplaceMock: ContractsControllerBase;
                t721controllerMock: ContractsControllerBase;
            } = {
                metaMarketplaceMock: mock(ContractsControllerBase),
                t721controllerMock: mock(ContractsControllerBase),
            };

            const t721aInstance = {
                _address: t721aaddress,
                methods: {},
            };
            const t721cInstance = {
                _address: t721caddress,
                methods: {
                    createGroup: (name: string) => ({
                        encodeABI: () => '0xabcd',
                    }),
                    getNextGroupId: (addr: string) => ({
                        call: async () => {
                            throw new Error('cannot fetch');
                        },
                    }),
                    registerCategories: () => ({
                        encodeABI: () => '0xabcd',
                    }),
                },
            };

            when(subcontext.t721controllerMock.get()).thenResolve(
                t721cInstance,
            );
            when(context.t721AdminServiceMock.get()).thenResolve(t721aInstance);

            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(
                'ticket721_0',
            );
            when(
                context.configServiceMock.get('ETHEREUM_NODE_NETWORK_ID'),
            ).thenReturn('2702');
            when(
                context.configServiceMock.get('ETHEREUM_MTX_DOMAIN_NAME'),
            ).thenReturn('Refract Wallet');
            when(
                context.configServiceMock.get('ETHEREUM_MTX_VERSION'),
            ).thenReturn('0');

            when(
                context.ticketforgeServiceMock.getScopeContracts('ticket721_0'),
            ).thenReturn({
                mm: instance(subcontext.metaMarketplaceMock),
                t721c: instance(subcontext.t721controllerMock),
            });

            await expect(
                context.eventsController.getPayload(
                    {
                        event: eventId,
                    },
                    user,
                ),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.InternalServerError,
                    message: 'cannot_retrieve_group_id',
                },
                status: StatusCodes.InternalServerError,
                message: {
                    status: StatusCodes.InternalServerError,
                    message: 'cannot_retrieve_group_id',
                },
            });

            verify(
                context.eventsServiceMock.search(deepEqual({ id: eventId })),
            ).called();
            verify(subcontext.t721controllerMock.get()).called();
            verify(context.t721AdminServiceMock.get()).called();
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).called();
            verify(
                context.ticketforgeServiceMock.getScopeContracts('ticket721_0'),
            ).called();
        });

        it('should fail on date fetch', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                address: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
            } as any) as UserDto;
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: new Date('2020-02-20T09:02:57.492Z'),
                    event_end: new Date('2020-02-21T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: new Date('2020-02-23T09:02:57.492Z'),
                    event_end: new Date('2020-02-24T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                id: eventId,
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        sale_end: new Date('2020-02-20T08:02:57.492Z'),
                        resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        resale_end: new Date('2020-02-20T08:02:57.492Z'),
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [(event as any) as EventEntity],
            });

            const t721caddress = '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2';
            const t721aaddress = '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2';

            const subcontext: {
                metaMarketplaceMock: ContractsControllerBase;
                t721controllerMock: ContractsControllerBase;
            } = {
                metaMarketplaceMock: mock(ContractsControllerBase),
                t721controllerMock: mock(ContractsControllerBase),
            };

            const t721aInstance = {
                _address: t721aaddress,
                methods: {},
            };
            const t721cInstance = {
                _address: t721caddress,
                methods: {
                    createGroup: (name: string) => ({
                        encodeABI: () => '0xabcd',
                    }),
                    getNextGroupId: (addr: string) => ({
                        call: async () => toB32('this is an ID'),
                    }),
                    registerCategories: () => ({
                        encodeABI: () => '0xabcd',
                    }),
                },
            };

            when(subcontext.t721controllerMock.get()).thenResolve(
                t721cInstance,
            );
            when(context.t721AdminServiceMock.get()).thenResolve(t721aInstance);

            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(
                'ticket721_0',
            );
            when(
                context.configServiceMock.get('ETHEREUM_NODE_NETWORK_ID'),
            ).thenReturn('2702');
            when(
                context.configServiceMock.get('ETHEREUM_MTX_DOMAIN_NAME'),
            ).thenReturn('Refract Wallet');
            when(
                context.configServiceMock.get('ETHEREUM_MTX_VERSION'),
            ).thenReturn('0');

            when(
                context.ticketforgeServiceMock.getScopeContracts('ticket721_0'),
            ).thenReturn({
                mm: instance(subcontext.metaMarketplaceMock),
                t721c: instance(subcontext.t721controllerMock),
            });

            when(
                context.datesServiceMock.search(
                    deepEqual({
                        id: dateIds[0],
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.eventsController.getPayload(
                    {
                        event: eventId,
                    },
                    user,
                ),
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
                context.eventsServiceMock.search(deepEqual({ id: eventId })),
            ).called();
            verify(subcontext.t721controllerMock.get()).called();
            verify(context.t721AdminServiceMock.get()).called();
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).called();
            verify(
                context.ticketforgeServiceMock.getScopeContracts('ticket721_0'),
            ).called();
            verify(
                context.datesServiceMock.search(deepEqual({ id: dateIds[0] })),
            ).called();
        });

        it('should fail when date unavailable', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                address: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
            } as any) as UserDto;
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: new Date('2020-02-20T09:02:57.492Z'),
                    event_end: new Date('2020-02-21T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: new Date('2020-02-23T09:02:57.492Z'),
                    event_end: new Date('2020-02-24T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                id: eventId,
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        sale_end: new Date('2020-02-20T08:02:57.492Z'),
                        resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        resale_end: new Date('2020-02-20T08:02:57.492Z'),
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [(event as any) as EventEntity],
            });

            const t721caddress = '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2';
            const t721aaddress = '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2';

            const subcontext: {
                metaMarketplaceMock: ContractsControllerBase;
                t721controllerMock: ContractsControllerBase;
            } = {
                metaMarketplaceMock: mock(ContractsControllerBase),
                t721controllerMock: mock(ContractsControllerBase),
            };

            const t721aInstance = {
                _address: t721aaddress,
                methods: {},
            };
            const t721cInstance = {
                _address: t721caddress,
                methods: {
                    createGroup: (name: string) => ({
                        encodeABI: () => '0xabcd',
                    }),
                    getNextGroupId: (addr: string) => ({
                        call: async () => toB32('this is an ID'),
                    }),
                    registerCategories: () => ({
                        encodeABI: () => '0xabcd',
                    }),
                },
            };

            when(subcontext.t721controllerMock.get()).thenResolve(
                t721cInstance,
            );
            when(context.t721AdminServiceMock.get()).thenResolve(t721aInstance);

            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn(
                'ticket721_0',
            );
            when(
                context.configServiceMock.get('ETHEREUM_NODE_NETWORK_ID'),
            ).thenReturn('2702');
            when(
                context.configServiceMock.get('ETHEREUM_MTX_DOMAIN_NAME'),
            ).thenReturn('Refract Wallet');
            when(
                context.configServiceMock.get('ETHEREUM_MTX_VERSION'),
            ).thenReturn('0');

            when(
                context.ticketforgeServiceMock.getScopeContracts('ticket721_0'),
            ).thenReturn({
                mm: instance(subcontext.metaMarketplaceMock),
                t721c: instance(subcontext.t721controllerMock),
            });

            when(
                context.datesServiceMock.search(
                    deepEqual({
                        id: dateIds[0],
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            await expect(
                context.eventsController.getPayload(
                    {
                        event: eventId,
                    },
                    user,
                ),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.NotFound,
                    message: 'date_entry_not_found',
                },
                status: StatusCodes.NotFound,
                message: {
                    status: StatusCodes.NotFound,
                    message: 'date_entry_not_found',
                },
            });

            verify(
                context.eventsServiceMock.search(deepEqual({ id: eventId })),
            ).called();
            verify(subcontext.t721controllerMock.get()).called();
            verify(context.t721AdminServiceMock.get()).called();
            verify(context.configServiceMock.get('TICKETFORGE_SCOPE')).called();
            verify(
                context.ticketforgeServiceMock.getScopeContracts('ticket721_0'),
            ).called();
            verify(
                context.datesServiceMock.search(deepEqual({ id: dateIds[0] })),
            ).called();
        });
    });

    describe('deploy', function() {
        it('should deploy an event to the ethereum blockchain', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                address: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
            } as any) as UserDto;
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: new Date('2020-02-20T09:02:57.492Z'),
                    event_end: new Date('2020-02-21T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: new Date('2020-02-23T09:02:57.492Z'),
                    event_end: new Date('2020-02-24T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                id: eventId,
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        sale_end: new Date('2020-02-20T08:02:57.492Z'),
                        resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        resale_end: new Date('2020-02-20T08:02:57.492Z'),
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };
            const payload = {
                domain: {
                    name: 'Refract Wallet',
                    version: '0',
                    chainId: 2702,
                    verifyingContract:
                        '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                },
                primaryType: 'MetaTransaction',
                types: {
                    MetaTransaction: [
                        {
                            name: 'parameters',
                            type: 'TransactionParameters[]',
                        },
                        {
                            name: 'nonce',
                            type: 'uint256',
                        },
                    ],
                    TransactionParameters: [
                        {
                            type: 'address',
                            name: 'from',
                        },
                        {
                            type: 'address',
                            name: 'to',
                        },
                        {
                            type: 'address',
                            name: 'relayer',
                        },
                        {
                            type: 'uint256',
                            name: 'value',
                        },
                        {
                            type: 'bytes',
                            name: 'data',
                        },
                    ],
                    EIP712Domain: [
                        {
                            name: 'name',
                            type: 'string',
                        },
                        {
                            name: 'version',
                            type: 'string',
                        },
                        {
                            name: 'chainId',
                            type: 'uint256',
                        },
                        {
                            name: 'verifyingContract',
                            type: 'address',
                        },
                    ],
                },
                message: {
                    nonce: 1,
                    parameters: [
                        {
                            from: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                            to: '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            relayer:
                                '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            data: '0xabcd',
                            value: '0',
                        },
                        {
                            from: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                            to: '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            relayer:
                                '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            data: '0xabcd',
                            value: '0',
                        },
                    ],
                },
            };

            const signature =
                '0x57e896adc9d2be241d33fac3dfcef5cc0004a244ac406ea7dacba15d3e073949b3eb522c404b98361f229745ac0e42ad432568234fe37cd632021f08c75c343c6a';

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [(event as any) as EventEntity],
            });

            const spiedEventsController = spy(context.eventsController);
            when(
                spiedEventsController.getPayload(
                    deepEqual({
                        event: event.id,
                    }),
                    deepEqual(user),
                ),
            ).thenResolve({
                payload,
                groupId: toB32('an event ID'),
            });

            when(
                context.txsServiceMock.mtx(deepEqual(payload), signature, user),
            ).thenResolve({
                error: null,
                response: ({
                    transaction_hash:
                        '0x0899e1c32d82b06931843e3aabf33bf8fd3f7748bf9a423de23f018c78f86f32',
                    confirmed: false,
                    block_number: 0,
                } as any) as TxEntity,
            });

            when(
                context.eventsServiceMock.update(
                    deepEqual({
                        id: eventId,
                    }),
                    deepEqual({
                        group_id: toB32('an event ID'),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            const res = await context.eventsController.deploy(
                {
                    event: eventId,
                    signature,
                    payload,
                },
                user,
            );

            expect(res).toEqual({
                event: {
                    name: 'Justice Woman WorldWide 2020',
                    id: '64f35afc-8e13-4f80-b9e6-00a6ef52a78d',
                    description: 'Justice Concert',
                    status: 'preview',
                    address: null,
                    owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                    admins: [],
                    dates: [
                        '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                        '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                    ],
                    categories: [
                        {
                            group_id: null,
                            category_name: 'vip_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 100,
                        },
                    ],
                    avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                    banners: [
                        'decdea0b-2d00-4d57-b100-955f7ba41412',
                        '531d71c9-ee88-4989-8925-ed8be8a7f918',
                    ],
                    group_id:
                        '0x616e206576656e74204944000000000000000000000000000000000000000000',
                },
            });

            verify(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).called();
            verify(
                spiedEventsController.getPayload(
                    deepEqual({
                        event: event.id,
                    }),
                    deepEqual(user),
                ),
            ).called();
            verify(
                context.txsServiceMock.mtx(deepEqual(payload), signature, user),
            ).called();
            verify(
                context.eventsServiceMock.update(
                    deepEqual({
                        id: eventId,
                    }),
                    deepEqual({
                        group_id: toB32('an event ID'),
                    }),
                ),
            ).called();
        });

        it('should fail on event fetch error', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                address: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
            } as any) as UserDto;
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: new Date('2020-02-20T09:02:57.492Z'),
                    event_end: new Date('2020-02-21T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: new Date('2020-02-23T09:02:57.492Z'),
                    event_end: new Date('2020-02-24T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                id: eventId,
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        sale_end: new Date('2020-02-20T08:02:57.492Z'),
                        resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        resale_end: new Date('2020-02-20T08:02:57.492Z'),
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };
            const payload = {
                domain: {
                    name: 'Refract Wallet',
                    version: '0',
                    chainId: 2702,
                    verifyingContract:
                        '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                },
                primaryType: 'MetaTransaction',
                types: {
                    MetaTransaction: [
                        {
                            name: 'parameters',
                            type: 'TransactionParameters[]',
                        },
                        {
                            name: 'nonce',
                            type: 'uint256',
                        },
                    ],
                    TransactionParameters: [
                        {
                            type: 'address',
                            name: 'from',
                        },
                        {
                            type: 'address',
                            name: 'to',
                        },
                        {
                            type: 'address',
                            name: 'relayer',
                        },
                        {
                            type: 'uint256',
                            name: 'value',
                        },
                        {
                            type: 'bytes',
                            name: 'data',
                        },
                    ],
                    EIP712Domain: [
                        {
                            name: 'name',
                            type: 'string',
                        },
                        {
                            name: 'version',
                            type: 'string',
                        },
                        {
                            name: 'chainId',
                            type: 'uint256',
                        },
                        {
                            name: 'verifyingContract',
                            type: 'address',
                        },
                    ],
                },
                message: {
                    nonce: 1,
                    parameters: [
                        {
                            from: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                            to: '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            relayer:
                                '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            data: '0xabcd',
                            value: '0',
                        },
                        {
                            from: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                            to: '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            relayer:
                                '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            data: '0xabcd',
                            value: '0',
                        },
                    ],
                },
            };

            const signature =
                '0x57e896adc9d2be241d33fac3dfcef5cc0004a244ac406ea7dacba15d3e073949b3eb522c404b98361f229745ac0e42ad432568234fe37cd632021f08c75c343c6a';

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.eventsController.deploy(
                    {
                        event: eventId,
                        signature,
                        payload,
                    },
                    user,
                ),
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
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).called();
        });

        it('should fail on event not found', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                address: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
            } as any) as UserDto;
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: new Date('2020-02-20T09:02:57.492Z'),
                    event_end: new Date('2020-02-21T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: new Date('2020-02-23T09:02:57.492Z'),
                    event_end: new Date('2020-02-24T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                id: eventId,
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        sale_end: new Date('2020-02-20T08:02:57.492Z'),
                        resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        resale_end: new Date('2020-02-20T08:02:57.492Z'),
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };
            const payload = {
                domain: {
                    name: 'Refract Wallet',
                    version: '0',
                    chainId: 2702,
                    verifyingContract:
                        '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                },
                primaryType: 'MetaTransaction',
                types: {
                    MetaTransaction: [
                        {
                            name: 'parameters',
                            type: 'TransactionParameters[]',
                        },
                        {
                            name: 'nonce',
                            type: 'uint256',
                        },
                    ],
                    TransactionParameters: [
                        {
                            type: 'address',
                            name: 'from',
                        },
                        {
                            type: 'address',
                            name: 'to',
                        },
                        {
                            type: 'address',
                            name: 'relayer',
                        },
                        {
                            type: 'uint256',
                            name: 'value',
                        },
                        {
                            type: 'bytes',
                            name: 'data',
                        },
                    ],
                    EIP712Domain: [
                        {
                            name: 'name',
                            type: 'string',
                        },
                        {
                            name: 'version',
                            type: 'string',
                        },
                        {
                            name: 'chainId',
                            type: 'uint256',
                        },
                        {
                            name: 'verifyingContract',
                            type: 'address',
                        },
                    ],
                },
                message: {
                    nonce: 1,
                    parameters: [
                        {
                            from: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                            to: '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            relayer:
                                '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            data: '0xabcd',
                            value: '0',
                        },
                        {
                            from: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                            to: '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            relayer:
                                '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            data: '0xabcd',
                            value: '0',
                        },
                    ],
                },
            };

            const signature =
                '0x57e896adc9d2be241d33fac3dfcef5cc0004a244ac406ea7dacba15d3e073949b3eb522c404b98361f229745ac0e42ad432568234fe37cd632021f08c75c343c6a';

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            await expect(
                context.eventsController.deploy(
                    {
                        event: eventId,
                        signature,
                        payload,
                    },
                    user,
                ),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.NotFound,
                    message: 'event_not_found',
                },
                status: StatusCodes.NotFound,
                message: {
                    status: StatusCodes.NotFound,
                    message: 'event_not_found',
                },
            });

            verify(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).called();
        });

        it('should fail on invalid payload', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                address: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
            } as any) as UserDto;
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: new Date('2020-02-20T09:02:57.492Z'),
                    event_end: new Date('2020-02-21T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: new Date('2020-02-23T09:02:57.492Z'),
                    event_end: new Date('2020-02-24T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                id: eventId,
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        sale_end: new Date('2020-02-20T08:02:57.492Z'),
                        resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        resale_end: new Date('2020-02-20T08:02:57.492Z'),
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };

            const payload = {
                domain: {
                    name: 'Refract Wallet',
                    version: '0',
                    chainId: 2702,
                    verifyingContract:
                        '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                },
                primaryType: 'MetaTransaction',
                types: {
                    MetaTransaction: [
                        {
                            name: 'parameters',
                            type: 'TransactionParameters[]',
                        },
                        {
                            name: 'nonce',
                            type: 'uint256',
                        },
                    ],
                    TransactionParameters: [
                        {
                            type: 'address',
                            name: 'from',
                        },
                        {
                            type: 'address',
                            name: 'to',
                        },
                        {
                            type: 'address',
                            name: 'relayer',
                        },
                        {
                            type: 'uint256',
                            name: 'value',
                        },
                        {
                            type: 'bytes',
                            name: 'data',
                        },
                    ],
                    EIP712Domain: [
                        {
                            name: 'name',
                            type: 'string',
                        },
                        {
                            name: 'version',
                            type: 'string',
                        },
                        {
                            name: 'chainId',
                            type: 'uint256',
                        },
                        {
                            name: 'verifyingContract',
                            type: 'address',
                        },
                    ],
                },
                message: {
                    nonce: 1,
                    parameters: [
                        {
                            from: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                            to: '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            relayer:
                                '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            data: '0xabcd',
                            value: '0',
                        },
                        {
                            from: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                            to: '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            relayer:
                                '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            data: '0xabcd',
                            value: '0',
                        },
                    ],
                },
            };

            const signature =
                '0x57e896adc9d2be241d33fac3dfcef5cc0004a244ac406ea7dacba15d3e073949b3eb522c404b98361f229745ac0e42ad432568234fe37cd632021f08c75c343c6a';

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [(event as any) as EventEntity],
            });

            const spiedEventsController = spy(context.eventsController);
            when(
                spiedEventsController.getPayload(
                    deepEqual({
                        event: event.id,
                    }),
                    deepEqual(user),
                ),
            ).thenResolve({
                payload,
                groupId: toB32('an event ID'),
            });

            await expect(
                context.eventsController.deploy(
                    {
                        event: eventId,
                        signature,
                        payload: {
                            ...payload,
                            domain: {
                                ...payload.domain,
                                name: 'invalid',
                            },
                        },
                    },
                    user,
                ),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_payload',
                },
                status: StatusCodes.BadRequest,
                message: {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_payload',
                },
            });

            verify(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).called();
            verify(
                spiedEventsController.getPayload(
                    deepEqual({
                        event: event.id,
                    }),
                    deepEqual(user),
                ),
            ).called();
        });

        it('should fail on mtx fail', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                address: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
            } as any) as UserDto;
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: new Date('2020-02-20T09:02:57.492Z'),
                    event_end: new Date('2020-02-21T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: new Date('2020-02-23T09:02:57.492Z'),
                    event_end: new Date('2020-02-24T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                id: eventId,
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        sale_end: new Date('2020-02-20T08:02:57.492Z'),
                        resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        resale_end: new Date('2020-02-20T08:02:57.492Z'),
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };
            const payload = {
                domain: {
                    name: 'Refract Wallet',
                    version: '0',
                    chainId: 2702,
                    verifyingContract:
                        '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                },
                primaryType: 'MetaTransaction',
                types: {
                    MetaTransaction: [
                        {
                            name: 'parameters',
                            type: 'TransactionParameters[]',
                        },
                        {
                            name: 'nonce',
                            type: 'uint256',
                        },
                    ],
                    TransactionParameters: [
                        {
                            type: 'address',
                            name: 'from',
                        },
                        {
                            type: 'address',
                            name: 'to',
                        },
                        {
                            type: 'address',
                            name: 'relayer',
                        },
                        {
                            type: 'uint256',
                            name: 'value',
                        },
                        {
                            type: 'bytes',
                            name: 'data',
                        },
                    ],
                    EIP712Domain: [
                        {
                            name: 'name',
                            type: 'string',
                        },
                        {
                            name: 'version',
                            type: 'string',
                        },
                        {
                            name: 'chainId',
                            type: 'uint256',
                        },
                        {
                            name: 'verifyingContract',
                            type: 'address',
                        },
                    ],
                },
                message: {
                    nonce: 1,
                    parameters: [
                        {
                            from: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                            to: '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            relayer:
                                '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            data: '0xabcd',
                            value: '0',
                        },
                        {
                            from: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                            to: '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            relayer:
                                '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            data: '0xabcd',
                            value: '0',
                        },
                    ],
                },
            };

            const signature =
                '0x57e896adc9d2be241d33fac3dfcef5cc0004a244ac406ea7dacba15d3e073949b3eb522c404b98361f229745ac0e42ad432568234fe37cd632021f08c75c343c6a';

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [(event as any) as EventEntity],
            });

            const spiedEventsController = spy(context.eventsController);
            when(
                spiedEventsController.getPayload(
                    deepEqual({
                        event: event.id,
                    }),
                    deepEqual(user),
                ),
            ).thenResolve({
                payload,
                groupId: toB32('an event ID'),
            });

            when(
                context.txsServiceMock.mtx(deepEqual(payload), signature, user),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.eventsController.deploy(
                    {
                        event: eventId,
                        signature,
                        payload,
                    },
                    user,
                ),
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
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).called();
            verify(
                spiedEventsController.getPayload(
                    deepEqual({
                        event: event.id,
                    }),
                    deepEqual(user),
                ),
            ).called();
            verify(
                context.txsServiceMock.mtx(deepEqual(payload), signature, user),
            ).called();
        });

        it('should fail event update fail', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                address: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
            } as any) as UserDto;
            const dateIds = [
                '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
            ];
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: new Date('2020-02-20T09:02:57.492Z'),
                    event_end: new Date('2020-02-21T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label:
                        '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
                {
                    event_begin: new Date('2020-02-23T09:02:57.492Z'),
                    event_end: new Date('2020-02-24T09:02:57.492Z'),
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.37087,
                        lat: 48.86311,
                    },
                    location_label: '50 Boulevard Voltaire, 75011 Paris',
                    metadata: {
                        name: 'Bataclan',
                    },
                    parent_id: null,
                    parent_type: null,
                    categories: [
                        {
                            group_id: null,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            sale_end: new Date('2020-02-20T08:02:57.492Z'),
                            resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                            resale_end: new Date('2020-02-20T08:02:57.492Z'),
                            scope: 'ticket721_0',
                            status: 'preview',
                            prices: [
                                {
                                    currency: 'T721Token',
                                    value: '100',
                                    log_value: 6.643856189774724,
                                },
                            ],
                            seats: 200,
                        },
                    ],
                },
            ];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const event: Partial<EventEntity> = {
                name: 'Justice Woman WorldWide 2020',
                id: eventId,
                description: 'Justice Concert',
                status: 'preview',
                address: null,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: [
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a76d',
                    '64f35afc-8e13-4f80-b9e6-00a6ef52a77d',
                ],
                categories: [
                    {
                        group_id: null,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        sale_end: new Date('2020-02-20T08:02:57.492Z'),
                        resale_begin: new Date('2020-02-19T10:02:57.492Z'),
                        resale_end: new Date('2020-02-20T08:02:57.492Z'),
                        scope: 'ticket721_0',
                        status: 'preview',
                        prices: [
                            {
                                currency: 'T721Token',
                                value: '100',
                                log_value: 6.643856189774724,
                            },
                        ],
                        seats: 100,
                    },
                ],
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: [
                    'decdea0b-2d00-4d57-b100-955f7ba41412',
                    '531d71c9-ee88-4989-8925-ed8be8a7f918',
                ],
            };
            const payload = {
                domain: {
                    name: 'Refract Wallet',
                    version: '0',
                    chainId: 2702,
                    verifyingContract:
                        '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                },
                primaryType: 'MetaTransaction',
                types: {
                    MetaTransaction: [
                        {
                            name: 'parameters',
                            type: 'TransactionParameters[]',
                        },
                        {
                            name: 'nonce',
                            type: 'uint256',
                        },
                    ],
                    TransactionParameters: [
                        {
                            type: 'address',
                            name: 'from',
                        },
                        {
                            type: 'address',
                            name: 'to',
                        },
                        {
                            type: 'address',
                            name: 'relayer',
                        },
                        {
                            type: 'uint256',
                            name: 'value',
                        },
                        {
                            type: 'bytes',
                            name: 'data',
                        },
                    ],
                    EIP712Domain: [
                        {
                            name: 'name',
                            type: 'string',
                        },
                        {
                            name: 'version',
                            type: 'string',
                        },
                        {
                            name: 'chainId',
                            type: 'uint256',
                        },
                        {
                            name: 'verifyingContract',
                            type: 'address',
                        },
                    ],
                },
                message: {
                    nonce: 1,
                    parameters: [
                        {
                            from: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                            to: '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            relayer:
                                '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            data: '0xabcd',
                            value: '0',
                        },
                        {
                            from: '0x40199ec7ad0622c159cda3409a1f22a6dfe61de9',
                            to: '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            relayer:
                                '0xf8A4d3a0B5859a24cd1320BA014ab17F623612e2',
                            data: '0xabcd',
                            value: '0',
                        },
                    ],
                },
            };

            const signature =
                '0x57e896adc9d2be241d33fac3dfcef5cc0004a244ac406ea7dacba15d3e073949b3eb522c404b98361f229745ac0e42ad432568234fe37cd632021f08c75c343c6a';

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [(event as any) as EventEntity],
            });

            const spiedEventsController = spy(context.eventsController);
            when(
                spiedEventsController.getPayload(
                    deepEqual({
                        event: event.id,
                    }),
                    deepEqual(user),
                ),
            ).thenResolve({
                payload,
                groupId: toB32('an event ID'),
            });

            when(
                context.txsServiceMock.mtx(deepEqual(payload), signature, user),
            ).thenResolve({
                error: null,
                response: ({
                    transaction_hash:
                        '0x0899e1c32d82b06931843e3aabf33bf8fd3f7748bf9a423de23f018c78f86f32',
                    confirmed: false,
                    block_number: 0,
                } as any) as TxEntity,
            });

            when(
                context.eventsServiceMock.update(
                    deepEqual({
                        id: eventId,
                    }),
                    deepEqual({
                        group_id: toB32('an event ID'),
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.eventsController.deploy(
                    {
                        event: eventId,
                        signature,
                        payload,
                    },
                    user,
                ),
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
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).called();
            verify(
                spiedEventsController.getPayload(
                    deepEqual({
                        event: event.id,
                    }),
                    deepEqual(user),
                ),
            ).called();
            verify(
                context.txsServiceMock.mtx(deepEqual(payload), signature, user),
            ).called();
            verify(
                context.eventsServiceMock.update(
                    deepEqual({
                        id: eventId,
                    }),
                    deepEqual({
                        group_id: toB32('an event ID'),
                    }),
                ),
            ).called();
        });
    });
});
