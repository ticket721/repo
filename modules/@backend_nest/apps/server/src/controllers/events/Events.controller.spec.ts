import { Test, TestingModule } from '@nestjs/testing';
import { anyString, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
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
import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { getT721ControllerGroupID, toAcceptedAddressFormat, toB32 } from '@common/global';
import { types } from '@iaminfinity/express-cassandra';
import { UUIDToolService } from '@lib/common/toolbox/UUID.tool.service';
import { EventsStartInputDto } from '@app/server/controllers/events/dto/EventsStartInput.dto';

const context: {
    eventsController: EventsController;
    eventsServiceMock: EventsService;
    actionSetsServiceMock: ActionSetsService;
    configServiceMock: ConfigService;
    currenciesServiceMock: CurrenciesService;
    datesServiceMock: DatesService;
    vaultereumServiceMock: VaultereumService;
    uuidToolServiceMock: UUIDToolService;
} = {
    eventsController: null,
    eventsServiceMock: null,
    actionSetsServiceMock: null,
    configServiceMock: null,
    currenciesServiceMock: null,
    datesServiceMock: null,
    vaultereumServiceMock: null,
    uuidToolServiceMock: null,
};

describe('Events Controller', function() {
    beforeEach(async function() {
        context.eventsServiceMock = mock(EventsService);
        context.actionSetsServiceMock = mock(ActionSetsService);
        context.configServiceMock = mock(ConfigService);
        context.currenciesServiceMock = mock(CurrenciesService);
        context.datesServiceMock = mock(DatesService);
        context.vaultereumServiceMock = mock(VaultereumService);
        context.uuidToolServiceMock = mock(UUIDToolService);

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

        const UUIDToolServiceProvider = {
            provide: UUIDToolService,
            useValue: instance(context.uuidToolServiceMock),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventsServiceProvider,
                ActionSetsServiceProvider,
                ConfigServiceProvider,
                CurrenciesServiceProvider,
                DatesServiceProvider,
                VaultereumServiceProvider,
                UUIDToolServiceProvider,
            ],
            controllers: [EventsController],
        }).compile();

        context.eventsController = module.get<EventsController>(EventsController);
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
                    dates: ['ec677b12-d420-43a6-a597-ef84bf09f845', 'ec677b12-d420-43a6-a597-ef84bf09f845'],
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

            when(context.eventsServiceMock.searchElastic(deepEqual(internalEsQuery))).thenResolve({
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

            when(context.actionSetsServiceMock.create(deepEqual(entity))).thenResolve({
                response: {
                    ...entity,
                    ...extra_fields,
                } as ActionSetEntity,
                error: null,
            });

            const res: EventsCreateResponseDto = await context.eventsController.create(body, {
                id: 'cb70b84f-2746-4afb-b789-01f4917f3b28',
            } as UserDto);

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

            when(context.actionSetsServiceMock.create(deepEqual(entity))).thenResolve({
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
            const dateIds = ['64f35afc-8e13-4f80-b9e6-00a6ef52a76d', '64f35afc-8e13-4f80-b9e6-00a6ef52a77d'];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const eventAddress = toAcceptedAddressFormat('0x30199ec7ad0622c159cda3409a1f22a6dfe61de9');
            const groupId = getT721ControllerGroupID(eventId, eventAddress);
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: ('2020-02-20T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-21T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: types.Uuid.fromString(eventId) as any,
                    parent_type: 'event',
                    categories: [
                        {
                            group_id: groupId,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
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
                    parent_id: types.Uuid.fromString(eventId) as any,
                    parent_type: 'event',
                    categories: [
                        {
                            group_id: groupId,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
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
            const event: Partial<EventEntity> = {
                id: types.Uuid.fromString(eventId) as any,
                name: 'Justice Woman WorldWide 2020',
                description: 'Justice Concert',
                status: 'preview',
                address: eventAddress,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: ['64f35afc-8e13-4f80-b9e6-00a6ef52a76d', '64f35afc-8e13-4f80-b9e6-00a6ef52a77d'],
                categories: [
                    {
                        group_id: groupId,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        scope: 'ticket721_0',
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
                group_id: groupId,
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: ['decdea0b-2d00-4d57-b100-955f7ba41412', '531d71c9-ee88-4989-8925-ed8be8a7f918'],
            };

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

            when(context.uuidToolServiceMock.generate()).thenReturn(eventId);

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

            when(context.vaultereumServiceMock.write(anyString())).thenResolve({
                error: null,
                response: vaultereumAddressResponse,
            });

            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn('ticket721_0');

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

            when(context.datesServiceMock.create(deepEqual(dates[0]))).thenResolve({
                error: null,
                response: ({
                    ...dates[0],
                    id: dateIds[0],
                } as any) as DateEntity,
            });

            when(context.datesServiceMock.create(deepEqual(dates[1]))).thenResolve({
                error: null,
                response: ({
                    ...dates[1],
                    id: dateIds[1],
                } as any) as DateEntity,
            });

            when(context.eventsServiceMock.create(deepEqual(event))).thenResolve({
                error: null,
                response: event as EventEntity,
            });

            const res = await context.eventsController.build(
                {
                    completedActionSet: actionSetId,
                },
                user,
            );

            expect(res).toEqual({
                event,
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
            verify(context.datesServiceMock.create(deepEqual(dates[0]))).called();
            verify(context.datesServiceMock.create(deepEqual(dates[1]))).called();
            verify(context.eventsServiceMock.create(deepEqual(event))).called();
            verify(context.vaultereumServiceMock.write(`ethereum/accounts/event-${eventId.toLowerCase()}`)).called();
        });

        it('error while fetching actionsets', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
            } as any) as UserDto;
            const actionSetId = '64f35afc-8e13-4f80-b9e6-00a6ef52a75d';

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

        it('actionset not found', async function() {
            const user = ({
                id: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
            } as any) as UserDto;
            const actionSetId = '64f35afc-8e13-4f80-b9e6-00a6ef52a75d';

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

        it('incomplete actionset', async function() {
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
                current_status: 'input:waiting',
                dispatched_at: new Date('2020-02-19T09:02:57.547Z'),
                name: '@events/creation',
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                updated_at: new Date('2020-02-19T09:03:02.999Z'),
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

        it('not actionset owner', async function() {
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

        it('should fail on collision check error', async function() {
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
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';

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

            when(context.uuidToolServiceMock.generate()).thenReturn(eventId);

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
        });

        it('should fail on vaultereum account creation', async function() {
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
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';

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

            when(context.uuidToolServiceMock.generate()).thenReturn(eventId);

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

            when(context.vaultereumServiceMock.write(anyString())).thenResolve({
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
            verify(context.vaultereumServiceMock.write(`ethereum/accounts/event-${eventId.toLowerCase()}`)).called();
        });

        it('should fail on entity conversion error', async function() {
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
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const eventAddress = toAcceptedAddressFormat('0x30199ec7ad0622c159cda3409a1f22a6dfe61de9');
            const groupId = getT721ControllerGroupID(eventId, eventAddress);
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: ('2020-02-20T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-21T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: types.Uuid.fromString(eventId) as any,
                    parent_type: 'event',
                    categories: [
                        {
                            group_id: groupId,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
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
                    parent_id: types.Uuid.fromString(eventId) as any,
                    parent_type: 'event',
                    categories: [
                        {
                            group_id: groupId,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
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

            when(context.uuidToolServiceMock.generate()).thenReturn(eventId);

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

            when(context.vaultereumServiceMock.write(anyString())).thenResolve({
                error: null,
                response: vaultereumAddressResponse,
            });

            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn('ticket721_0');

            when(context.currenciesServiceMock.get('Fiat')).thenReject(new Error('unexpected_error'));

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

        it('should fail on date creation', async function() {
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
            const dateIds = ['64f35afc-8e13-4f80-b9e6-00a6ef52a76d', '64f35afc-8e13-4f80-b9e6-00a6ef52a77d'];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const eventAddress = toAcceptedAddressFormat('0x30199ec7ad0622c159cda3409a1f22a6dfe61de9');
            const groupId = getT721ControllerGroupID(eventId, eventAddress);
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: ('2020-02-20T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-21T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: types.Uuid.fromString(eventId) as any,
                    parent_type: 'event',
                    categories: [
                        {
                            group_id: groupId,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
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
                    parent_id: types.Uuid.fromString(eventId) as any,
                    parent_type: 'event',
                    categories: [
                        {
                            group_id: groupId,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
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

            when(context.uuidToolServiceMock.generate()).thenReturn(eventId);

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

            when(context.vaultereumServiceMock.write(anyString())).thenResolve({
                error: null,
                response: vaultereumAddressResponse,
            });

            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn('ticket721_0');

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

            when(context.datesServiceMock.create(deepEqual(dates[0]))).thenResolve({
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
            verify(context.datesServiceMock.create(deepEqual(dates[0]))).called();
            verify(context.vaultereumServiceMock.write(`ethereum/accounts/event-${eventId.toLowerCase()}`)).called();
        });

        it('should fail on event creation', async function() {
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
            const dateIds = ['64f35afc-8e13-4f80-b9e6-00a6ef52a76d', '64f35afc-8e13-4f80-b9e6-00a6ef52a77d'];
            const eventId = '64f35afc-8e13-4f80-b9e6-00a6ef52a78d';
            const eventAddress = toAcceptedAddressFormat('0x30199ec7ad0622c159cda3409a1f22a6dfe61de9');
            const groupId = getT721ControllerGroupID(eventId, eventAddress);
            const dates: Partial<DateEntity>[] = [
                {
                    event_begin: ('2020-02-20T09:02:57.492Z' as any) as Date,
                    event_end: ('2020-02-21T09:02:57.492Z' as any) as Date,
                    assigned_city: 1250015082,
                    location: {
                        lon: 2.34015,
                        lat: 48.882301,
                    },
                    location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    metadata: {
                        name: 'La Cigale',
                    },
                    parent_id: types.Uuid.fromString(eventId) as any,
                    parent_type: 'event',
                    categories: [
                        {
                            group_id: groupId,
                            category_name: 'regular_0_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
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
                    parent_id: types.Uuid.fromString(eventId) as any,
                    parent_type: 'event',
                    categories: [
                        {
                            group_id: groupId,
                            category_name: 'regular_1_0',
                            category_index: 0,
                            sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                            resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                            scope: 'ticket721_0',
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
            const event: Partial<EventEntity> = {
                id: types.Uuid.fromString(eventId) as any,
                name: 'Justice Woman WorldWide 2020',
                description: 'Justice Concert',
                status: 'preview',
                address: eventAddress,
                owner: 'c97ea2b4-174b-4d46-b307-9c010a03a385',
                admins: [],
                dates: ['64f35afc-8e13-4f80-b9e6-00a6ef52a76d', '64f35afc-8e13-4f80-b9e6-00a6ef52a77d'],
                categories: [
                    {
                        group_id: groupId,
                        category_name: 'vip_0',
                        category_index: 0,
                        sale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        sale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        resale_begin: ('2020-02-19T10:02:57.492Z' as any) as Date,
                        resale_end: ('2020-02-20T08:02:57.492Z' as any) as Date,
                        scope: 'ticket721_0',
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
                group_id: groupId,
                avatar: 'e9b7af81-2c57-47d6-ba9a-1cdb2f33c1cb',
                banners: ['decdea0b-2d00-4d57-b100-955f7ba41412', '531d71c9-ee88-4989-8925-ed8be8a7f918'],
            };

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

            when(context.uuidToolServiceMock.generate()).thenReturn(eventId);

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

            when(context.vaultereumServiceMock.write(anyString())).thenResolve({
                error: null,
                response: vaultereumAddressResponse,
            });

            when(context.configServiceMock.get('TICKETFORGE_SCOPE')).thenReturn('ticket721_0');

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

            when(context.datesServiceMock.create(deepEqual(dates[0]))).thenResolve({
                error: null,
                response: ({
                    ...dates[0],
                    id: dateIds[0],
                } as any) as DateEntity,
            });

            when(context.datesServiceMock.create(deepEqual(dates[1]))).thenResolve({
                error: null,
                response: ({
                    ...dates[1],
                    id: dateIds[1],
                } as any) as DateEntity,
            });

            when(context.eventsServiceMock.create(deepEqual(event))).thenResolve({
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
            verify(context.datesServiceMock.create(deepEqual(dates[0]))).called();
            verify(context.datesServiceMock.create(deepEqual(dates[1]))).called();
            verify(context.eventsServiceMock.create(deepEqual(event))).called();
            verify(context.vaultereumServiceMock.write(`ethereum/accounts/event-${eventId.toLowerCase()}`)).called();
        });
    });

    describe('start', function() {
        it('should start a preview event', async function() {
            const eventId = '0f3fad50-b83c-4e55-893e-585336fd7e42';
            const dateIds = ['b482a535-e5e0-4cb4-86eb-4683e03d771c', '7784070a-f19f-4c44-a26f-babef69084cf'];
            const user = {
                id: '60d356e9-031a-483c-afa3-1ab20cae3319',
            } as UserDto;

            const query: EventsStartInputDto = {
                event: eventId,
            };

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: eventId,
                        dates: dateIds,
                        owner: user.id,
                    } as EventEntity,
                ],
            });

            when(
                context.eventsServiceMock.update(
                    deepEqual({
                        id: eventId,
                    }),
                    deepEqual({
                        status: 'live',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.datesServiceMock.update(
                    deepEqual({
                        id: dateIds[0],
                    }),
                    deepEqual({
                        status: 'live',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.datesServiceMock.update(
                    deepEqual({
                        id: dateIds[1],
                    }),
                    deepEqual({
                        status: 'live',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            const res = await context.eventsController.start(query, user);

            expect(res.event).toEqual({
                id: eventId,
                dates: dateIds,
                owner: user.id,
                status: 'live',
            });
        });

        it('should start a preview event with specific dates', async function() {
            const eventId = '0f3fad50-b83c-4e55-893e-585336fd7e42';
            const dateIds = ['b482a535-e5e0-4cb4-86eb-4683e03d771c', '7784070a-f19f-4c44-a26f-babef69084cf'];
            const user = {
                id: '60d356e9-031a-483c-afa3-1ab20cae3319',
            } as UserDto;

            const query: EventsStartInputDto = {
                event: eventId,
                dates: [dateIds[0]],
            };

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: eventId,
                        dates: dateIds,
                        owner: user.id,
                    } as EventEntity,
                ],
            });

            when(
                context.eventsServiceMock.update(
                    deepEqual({
                        id: eventId,
                    }),
                    deepEqual({
                        status: 'live',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.datesServiceMock.update(
                    deepEqual({
                        id: dateIds[0],
                    }),
                    deepEqual({
                        status: 'live',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.datesServiceMock.update(
                    deepEqual({
                        id: dateIds[1],
                    }),
                    deepEqual({
                        status: 'live',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            const res = await context.eventsController.start(query, user);

            expect(res.event).toEqual({
                id: eventId,
                dates: dateIds,
                owner: user.id,
                status: 'live',
            });
        });

        it('should fail on event query error', async function() {
            const eventId = '0f3fad50-b83c-4e55-893e-585336fd7e42';
            const user = {
                id: '60d356e9-031a-483c-afa3-1ab20cae3319',
            } as UserDto;

            const query: EventsStartInputDto = {
                event: eventId,
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

            await expect(context.eventsController.start(query, user)).rejects.toMatchObject({
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
        });

        it('should fail on empty event query', async function() {
            const eventId = '0f3fad50-b83c-4e55-893e-585336fd7e42';
            const dateIds = ['b482a535-e5e0-4cb4-86eb-4683e03d771c', '7784070a-f19f-4c44-a26f-babef69084cf'];
            const user = {
                id: '60d356e9-031a-483c-afa3-1ab20cae3319',
            } as UserDto;

            const query: EventsStartInputDto = {
                event: eventId,
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

            await expect(context.eventsController.start(query, user)).rejects.toMatchObject({
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
        });

        it('should fail for authorization reasons', async function() {
            const eventId = '0f3fad50-b83c-4e55-893e-585336fd7e42';
            const dateIds = ['b482a535-e5e0-4cb4-86eb-4683e03d771c', '7784070a-f19f-4c44-a26f-babef69084cf'];
            const user = {
                id: '60d356e9-031a-483c-afa3-1ab20cae3319',
            } as UserDto;

            const query: EventsStartInputDto = {
                event: eventId,
            };

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: eventId,
                        dates: dateIds,
                        owner: dateIds[0],
                    } as EventEntity,
                ],
            });

            await expect(context.eventsController.start(query, user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.Unauthorized,
                    message: 'not_event_owner',
                },
                status: StatusCodes.Unauthorized,
                message: {
                    status: StatusCodes.Unauthorized,
                    message: 'not_event_owner',
                },
            });
        });

        it('should fail on event update fail', async function() {
            const eventId = '0f3fad50-b83c-4e55-893e-585336fd7e42';
            const dateIds = ['b482a535-e5e0-4cb4-86eb-4683e03d771c', '7784070a-f19f-4c44-a26f-babef69084cf'];
            const user = {
                id: '60d356e9-031a-483c-afa3-1ab20cae3319',
            } as UserDto;

            const query: EventsStartInputDto = {
                event: eventId,
            };

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: eventId,
                        dates: dateIds,
                        owner: user.id,
                    } as EventEntity,
                ],
            });

            when(
                context.eventsServiceMock.update(
                    deepEqual({
                        id: eventId,
                    }),
                    deepEqual({
                        status: 'live',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(context.eventsController.start(query, user)).rejects.toMatchObject({
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
        });

        it('should fail on invalid date id', async function() {
            const eventId = '0f3fad50-b83c-4e55-893e-585336fd7e42';
            const dateIds = ['b482a535-e5e0-4cb4-86eb-4683e03d771c', '7784070a-f19f-4c44-a26f-babef69084cf'];
            const user = {
                id: '60d356e9-031a-483c-afa3-1ab20cae3319',
            } as UserDto;

            const query: EventsStartInputDto = {
                event: eventId,
                dates: [user.id],
            };

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: eventId,
                        dates: dateIds,
                        owner: user.id,
                    } as EventEntity,
                ],
            });

            when(
                context.eventsServiceMock.update(
                    deepEqual({
                        id: eventId,
                    }),
                    deepEqual({
                        status: 'live',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await expect(context.eventsController.start(query, user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.BadRequest,
                    message: 'specified_date_not_in_event',
                },
                status: StatusCodes.BadRequest,
                message: {
                    status: StatusCodes.BadRequest,
                    message: 'specified_date_not_in_event',
                },
            });
        });

        it('should fail on date update fail', async function() {
            const eventId = '0f3fad50-b83c-4e55-893e-585336fd7e42';
            const dateIds = ['b482a535-e5e0-4cb4-86eb-4683e03d771c', '7784070a-f19f-4c44-a26f-babef69084cf'];
            const user = {
                id: '60d356e9-031a-483c-afa3-1ab20cae3319',
            } as UserDto;

            const query: EventsStartInputDto = {
                event: eventId,
            };

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: eventId,
                        dates: dateIds,
                        owner: user.id,
                    } as EventEntity,
                ],
            });

            when(
                context.eventsServiceMock.update(
                    deepEqual({
                        id: eventId,
                    }),
                    deepEqual({
                        status: 'live',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.datesServiceMock.update(
                    deepEqual({
                        id: dateIds[0],
                    }),
                    deepEqual({
                        status: 'live',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(context.eventsController.start(query, user)).rejects.toMatchObject({
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
        });
    });
});

// response: {
//     status: StatusCodes.InternalServerError,
//         message: 'unexpected_error',
// },
// status: StatusCodes.InternalServerError,
//     message: {
//     status: StatusCodes.InternalServerError,
//         message: 'unexpected_error',
// },
