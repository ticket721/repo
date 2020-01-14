import { Test, TestingModule } from '@nestjs/testing';
import { deepEqual, instance, mock, when } from 'ts-mockito';
import { Job, JobOptions } from 'bull';
import { uuid } from '@iaminfinity/express-cassandra';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ESSearchReturn } from '@lib/common/utils/ESSearchReturn';
import { EventsController } from '@app/server/controllers/events/Events.controller';
import { EventsService } from '@lib/common/events/Events.service';
import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { EventsCreateResponseDto } from '@app/server/controllers/events/dto/EventsCreateResponse.dto';
import { search } from '@lib/common/utils/ControllerBasics';
import { StatusCodes } from '@app/server/utils/codes';

class QueueMock<T = any> {
    add(name: string, data: T, opts?: JobOptions): Promise<Job<T>> {
        return null;
    }
}

const context: {
    eventsController: EventsController;
    eventsServiceMock: EventsService;
    actionSetsServiceMock: ActionSetsService;
} = {
    eventsController: null,
    eventsServiceMock: null,
    actionSetsServiceMock: null,
};

describe('Events Controller', function() {
    beforeEach(async function() {
        const eventsServiceMock: EventsService = mock(EventsService);
        const actionsSetsServiceMock: ActionSetsService = mock(
            ActionSetsService,
        );

        const EventsServiceProvider = {
            provide: EventsService,
            useValue: instance(eventsServiceMock),
        };

        const ActionSetsServiceProvider = {
            provide: ActionSetsService,
            useValue: instance(actionsSetsServiceMock),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [EventsServiceProvider, ActionSetsServiceProvider],
            controllers: [EventsController],
        }).compile();

        context.eventsController = module.get<EventsController>(
            EventsController,
        );
        context.eventsServiceMock = eventsServiceMock;
        context.actionSetsServiceMock = actionsSetsServiceMock;
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
                name: 'eventCreation',
                current_status: 'in progress',
                current_action: 0,
                owner: 'cb70b84f-2746-4afb-b789-01f4917f3b28',
                actions: [
                    {
                        name: 'eventTextMetadata',
                        data: JSON.stringify(body),
                        status: 'in progress',
                        error: null,
                        type: 'input',
                    },
                ],
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
                name: 'eventCreation',
                current_status: 'in progress',
                current_action: 0,
                owner: 'cb70b84f-2746-4afb-b789-01f4917f3b28',
                actions: [
                    {
                        name: 'eventTextMetadata',
                        data: JSON.stringify(body),
                        status: 'in progress',
                        error: null,
                        type: 'input',
                    },
                ],
            };

            const extra_fields = {
                id: 'cb70b84f-2746-4afb-b789-01f4917f3b28',
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
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
