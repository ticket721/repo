import { Test, TestingModule } from '@nestjs/testing';
import { anything, deepEqual, instance, mock, when } from 'ts-mockito';
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
});
