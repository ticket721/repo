import { Test, TestingModule } from '@nestjs/testing';
import { anything, capture, deepEqual, instance, mock, when } from 'ts-mockito';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { uuid } from '@iaminfinity/express-cassandra';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ESSearchReturn } from '@lib/common/utils/ESSearchReturn';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { ActionSetsController } from '@app/server/controllers/actionsets/ActionSets.controller';
import { ActionsUpdateInputDto } from '@app/server/controllers/actionsets/dto/ActionsUpdateInput.dto';
import { StatusCodes } from '@lib/common/utils/codes';
import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';

const context: {
    actionsController: ActionSetsController;
    actionSetsServiceMock: ActionSetsService;
    queueMock: Queue;
} = {
    actionsController: null,
    actionSetsServiceMock: null,
    queueMock: null,
};

class QueueMock {
    async add(...args: any[]): Promise<void> {}
}

describe('ActionSets Controller', function() {
    beforeEach(async function() {
        const actionsSetsServiceMock: ActionSetsService = mock(
            ActionSetsService,
        );
        const queueMock = mock(QueueMock);

        const ActionSetsServiceProvider = {
            provide: ActionSetsService,
            useValue: instance(actionsSetsServiceMock),
        };

        const QueueProvider = {
            provide: getQueueToken('action'),
            useValue: instance(queueMock),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [ActionSetsServiceProvider, QueueProvider],
            controllers: [ActionSetsController],
        }).compile();

        context.actionsController = module.get<ActionSetsController>(
            ActionSetsController,
        );
        context.actionSetsServiceMock = actionsSetsServiceMock;
        context.queueMock = queueMock as any;
    });

    describe('search', function() {
        test('should search for action sets', async function() {
            const query = {
                current_status: {
                    $eq: 'complete',
                },
            };

            const internalEsQuery = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        current_status: 'complete',
                                    },
                                },
                                {
                                    term: {
                                        owner:
                                            'ec677b12-d420-43a6-a597-ef84bf09f845',
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const entities: ActionSetEntity[] = [
                {
                    id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                    owner: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                    actions: [],
                    current_action: 0,
                    current_status: 'complete',
                    name: 'test',
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                    dispatched_at: new Date(Date.now()),
                },
            ];

            const esReturn: ESSearchReturn<ActionSetEntity> = {
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
                context.actionSetsServiceMock.searchElastic(
                    deepEqual(internalEsQuery),
                ),
            ).thenResolve({
                error: null,
                response: esReturn,
            });

            const res = await context.actionsController.search(query, {
                id: uuid('ec677b12-d420-43a6-a597-ef84bf09f845') as any,
            } as UserDto);

            expect(res.actionsets).toEqual(entities);
        });
    });

    describe('hash', function() {
        test('should hash actionsets', async function() {
            const query = {
                current_status: {
                    $eq: 'complete',
                },
                hash_fields: ['id'],
            };

            const internalEsQuery = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        current_status: 'complete',
                                    },
                                },
                                {
                                    term: {
                                        owner:
                                            'ec677b12-d420-43a6-a597-ef84bf09f845',
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const entities: ActionSetEntity[] = [
                {
                    id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                    owner: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                    actions: [],
                    current_action: 0,
                    current_status: 'complete',
                    name: 'test',
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                    dispatched_at: new Date(Date.now()),
                },
            ];

            const esReturn: ESSearchReturn<ActionSetEntity> = {
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
                context.actionSetsServiceMock.searchElastic(
                    deepEqual(internalEsQuery),
                ),
            ).thenResolve({
                error: null,
                response: esReturn,
            });

            const res = await context.actionsController.hash(query, {
                id: uuid('ec677b12-d420-43a6-a597-ef84bf09f845') as any,
            } as UserDto);

            expect(res).toEqual({
                hash:
                    '0xf2b6eff34c60421fefacfb54409487b90dd21772e1832bba2426c2dfc7c3d1e4',
                count: 1,
            });
        });
    });

    describe('updateAction', function() {
        test('should update actionset', async function() {
            const query: ActionsUpdateInputDto = {
                actionset_id: 'cf2ef65-3632-4277-a061-dddfefac48de',
                data: {
                    any: {
                        data: {
                            would: {
                                work: '!',
                            },
                        },
                    },
                },
            };
            const owner = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
            };

            const creation = new Date(Date.now());
            const update = new Date(Date.now());
            const dispatch = new Date(Date.now());

            const entity: ActionSetEntity = {
                id: 'cf2ef65-3632-4277-a061-dddfefac48de',
                owner: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        name: 'test',
                        status: 'in progress',
                        type: 'input',
                        data: '{}',
                        error: null,
                    },
                ],
                current_action: 0,
                current_status: 'complete',
                name: 'test',
                created_at: creation,
                updated_at: update,
                dispatched_at: new Date(Date.now()),
            };

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: query.actionset_id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [entity],
            });

            when(
                context.actionSetsServiceMock.update(
                    deepEqual({
                        id: query.actionset_id,
                    }),
                    deepEqual({
                        owner: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                        actions: [
                            {
                                name: 'test',
                                status: 'waiting',
                                type: 'input',
                                data: JSON.stringify(query.data),
                                error: null,
                            },
                        ],
                        current_action: 0,
                        current_status: 'input:waiting',
                        name: 'test',
                        created_at: creation,
                        updated_at: update,
                        dispatched_at: anything(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    info: {
                        queriedHost: '127.0.0.1:32702',
                        triedHosts: {
                            '127.0.0.1:32702': null,
                        },
                        speculativeExecutions: 0,
                        achievedConsistency: 1,
                    },
                    rows: [
                        {
                            '[applied]': true,
                        },
                    ],
                    rowLength: 1,
                    columns: [
                        {
                            name: '[applied]',
                            type: {
                                code: 4,
                                type: null,
                            },
                        },
                    ],
                    pageState: null,
                } as any,
            });

            const res = await context.actionsController.updateAction(
                query,
                owner as UserDto,
            );

            expect(res.actionset).toEqual({
                info: {
                    queriedHost: '127.0.0.1:32702',
                    triedHosts: {
                        '127.0.0.1:32702': null,
                    },
                    speculativeExecutions: 0,
                    achievedConsistency: 1,
                },
                rows: [
                    {
                        '[applied]': true,
                    },
                ],
                rowLength: 1,
                columns: [
                    {
                        name: '[applied]',
                        type: {
                            code: 4,
                            type: null,
                        },
                    },
                ],
                pageState: null,
            });
        });

        test('update error', async function() {
            const query: ActionsUpdateInputDto = {
                actionset_id: 'cf2ef65-3632-4277-a061-dddfefac48de',
                data: {
                    any: {
                        data: {
                            would: {
                                work: '!',
                            },
                        },
                    },
                },
            };
            const owner = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
            };

            const creation = new Date(Date.now());
            const update = new Date(Date.now());
            const dispatch = new Date(Date.now());

            const entity: ActionSetEntity = {
                id: 'cf2ef65-3632-4277-a061-dddfefac48de',
                owner: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        name: 'test',
                        status: 'in progress',
                        type: 'input',
                        data: '{}',
                        error: null,
                    },
                ],
                current_action: 0,
                current_status: 'complete',
                name: 'test',
                created_at: creation,
                updated_at: update,
                dispatched_at: dispatch,
            };

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: query.actionset_id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [entity],
            });

            when(
                context.actionSetsServiceMock.update(
                    deepEqual({
                        id: query.actionset_id,
                    }),
                    deepEqual({
                        owner: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                        actions: [
                            {
                                name: 'test',
                                status: 'waiting',
                                type: 'input',
                                data: JSON.stringify(query.data),
                                error: null,
                            },
                        ],
                        current_action: 0,
                        current_status: 'input:waiting',
                        name: 'test',
                        created_at: creation,
                        updated_at: update,
                        dispatched_at: anything(),
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.actionsController.updateAction(query, owner as UserDto),
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
        });

        test('wrong owner', async function() {
            const query: ActionsUpdateInputDto = {
                actionset_id: 'cf2ef65-3632-4277-a061-dddfefac48de',
                data: {
                    any: {
                        data: {
                            would: {
                                work: '!',
                            },
                        },
                    },
                },
            };
            const owner = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f846',
            };

            const creation = new Date(Date.now());
            const update = new Date(Date.now());
            const dispatch = new Date(Date.now());

            const entity: ActionSetEntity = {
                id: 'cf2ef65-3632-4277-a061-dddfefac48de',
                owner: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        name: 'test',
                        status: 'in progress',
                        type: 'input',
                        data: '{}',
                        error: null,
                    },
                ],
                current_action: 0,
                current_status: 'complete',
                name: 'test',
                created_at: creation,
                updated_at: update,
                dispatched_at: dispatch,
            };

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: query.actionset_id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [entity],
            });

            await expect(
                context.actionsController.updateAction(query, owner as UserDto),
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
        });

        test('empty search response', async function() {
            const query: ActionsUpdateInputDto = {
                actionset_id: 'cf2ef65-3632-4277-a061-dddfefac48de',
                data: {
                    any: {
                        data: {
                            would: {
                                work: '!',
                            },
                        },
                    },
                },
            };
            const owner = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f846',
            };

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: query.actionset_id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            await expect(
                context.actionsController.updateAction(query, owner as UserDto),
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
        });

        test('search error', async function() {
            const query: ActionsUpdateInputDto = {
                actionset_id: 'cf2ef65-3632-4277-a061-dddfefac48de',
                data: {
                    any: {
                        data: {
                            would: {
                                work: '!',
                            },
                        },
                    },
                },
            };

            const owner = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f846',
            };

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: query.actionset_id,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.actionsController.updateAction(query, owner as UserDto),
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
        });

        test('should update previous actionset', async function() {
            const query: ActionsUpdateInputDto = {
                actionset_id: 'cf2ef65-3632-4277-a061-dddfefac48de',
                action_idx: 0,
                data: {
                    any: {
                        data: {
                            would: {
                                work: '!',
                            },
                        },
                    },
                },
            };
            const owner = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
            };

            const creation = new Date(Date.now());
            const update = new Date(Date.now());
            const dispatch = new Date(Date.now());

            const entity: ActionSetEntity = {
                id: 'cf2ef65-3632-4277-a061-dddfefac48de',
                owner: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        name: 'test',
                        status: 'complete',
                        type: 'input',
                        data: '{}',
                        error: null,
                    },
                    {
                        name: 'test2',
                        status: 'in progress',
                        type: 'input',
                        data: '{}',
                        error: null,
                    },
                ],
                current_action: 1,
                current_status: 'complete',
                name: 'test',
                created_at: creation,
                updated_at: update,
                dispatched_at: dispatch,
            };

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: query.actionset_id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [entity],
            });

            when(
                context.actionSetsServiceMock.update(
                    deepEqual({
                        id: query.actionset_id,
                    }),
                    deepEqual({
                        owner: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                        actions: [
                            {
                                name: 'test',
                                status: 'waiting',
                                type: 'input',
                                data: JSON.stringify(query.data),
                                error: null,
                            },
                            {
                                name: 'test2',
                                status: 'in progress',
                                type: 'input',
                                data: '{}',
                                error: null,
                            },
                        ],
                        current_action: 0,
                        current_status: 'input:waiting',
                        name: 'test',
                        created_at: creation,
                        updated_at: update,
                        dispatched_at: anything(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    info: {
                        queriedHost: '127.0.0.1:32702',
                        triedHosts: {
                            '127.0.0.1:32702': null,
                        },
                        speculativeExecutions: 0,
                        achievedConsistency: 1,
                    },
                    rows: [
                        {
                            '[applied]': true,
                        },
                    ],
                    rowLength: 1,
                    columns: [
                        {
                            name: '[applied]',
                            type: {
                                code: 4,
                                type: null,
                            },
                        },
                    ],
                    pageState: null,
                } as any,
            });

            const res = await context.actionsController.updateAction(
                query,
                owner as UserDto,
            );

            expect(res.actionset).toEqual({
                info: {
                    queriedHost: '127.0.0.1:32702',
                    triedHosts: {
                        '127.0.0.1:32702': null,
                    },
                    speculativeExecutions: 0,
                    achievedConsistency: 1,
                },
                rows: [
                    {
                        '[applied]': true,
                    },
                ],
                rowLength: 1,
                columns: [
                    {
                        name: '[applied]',
                        type: {
                            code: 4,
                            type: null,
                        },
                    },
                ],
                pageState: null,
            });
        });

        test('should fail updating next actionset', async function() {
            const query: ActionsUpdateInputDto = {
                actionset_id: 'cf2ef65-3632-4277-a061-dddfefac48de',
                action_idx: 1,
                data: {
                    any: {
                        data: {
                            would: {
                                work: '!',
                            },
                        },
                    },
                },
            };
            const owner = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
            };

            const creation = new Date(Date.now());
            const update = new Date(Date.now());
            const dispatch = new Date(Date.now());

            const entity: ActionSetEntity = {
                id: 'cf2ef65-3632-4277-a061-dddfefac48de',
                owner: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        name: 'test',
                        status: 'in progress',
                        type: 'input',
                        data: '{}',
                        error: null,
                    },
                    {
                        name: 'test2',
                        status: 'in progress',
                        type: 'input',
                        data: '{}',
                        error: null,
                    },
                ],
                current_action: 0,
                current_status: 'complete',
                name: 'test',
                created_at: creation,
                updated_at: update,
                dispatched_at: new Date(Date.now()),
            };

            when(
                context.actionSetsServiceMock.search(
                    deepEqual({
                        id: query.actionset_id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [entity],
            });

            await expect(
                context.actionsController.updateAction(query, owner as UserDto),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.BadRequest,
                    message: 'action_idx_after_current_action',
                },
                status: StatusCodes.BadRequest,
                message: {
                    status: StatusCodes.BadRequest,
                    message: 'action_idx_after_current_action',
                },
            });
        });
    });
});
