import { Test, TestingModule } from '@nestjs/testing';
import { deepEqual, instance, mock, when } from 'ts-mockito';
import { Job, JobOptions } from 'bull';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { uuid } from '@iaminfinity/express-cassandra';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ESSearchReturn } from '@lib/common/utils/ESSearchReturn';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { ActionSetsController } from '@app/server/controllers/actionsets/ActionSets.controller';
import { StatusCodes } from '@app/server/utils/codes';

class QueueMock<T = any> {
    add(name: string, data: T, opts?: JobOptions): Promise<Job<T>> {
        return null;
    }
}

const context: {
    actionsController: ActionSetsController;
    actionSetsServiceMock: ActionSetsService;
} = {
    actionsController: null,
    actionSetsServiceMock: null,
};

describe('ActionSets Controller', function() {
    beforeEach(async function() {
        const actionsSetsServiceMock: ActionSetsService = mock(
            ActionSetsService,
        );

        const ActionSetsServiceProvider = {
            provide: ActionSetsService,
            useValue: instance(actionsSetsServiceMock),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [ActionSetsServiceProvider],
            controllers: [ActionSetsController],
        }).compile();

        context.actionsController = module.get<ActionSetsController>(
            ActionSetsController,
        );
        context.actionSetsServiceMock = actionsSetsServiceMock;
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
                                        owner: 'ec677b12-d420-43a6-a597-ef84bf09f845',
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

        test('page_index without page_size', async function() {
            const query = {
                $page_index: 0,
                $page_size: null,
                current_status: {
                    $eq: 'complete',
                },
            };

            await expect(
                context.actionsController.search(query, {
                    id: uuid('ec677b12-d420-43a6-a597-ef84bf09f845') as any,
                } as UserDto),
            ).rejects.toMatchObject({
                response: {
                    status: StatusCodes.BadRequest,
                    message: 'page_index_without_page_size',
                },
                status: StatusCodes.BadRequest,
                message: {
                    status: StatusCodes.BadRequest,
                    message: 'page_index_without_page_size',
                },
            });
        });

        test('request error', async function() {
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
                                        owner: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            when(
                context.actionSetsServiceMock.searchElastic(
                    deepEqual(internalEsQuery),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.actionsController.search(query, {
                    id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                } as UserDto),
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

        test('empty result', async function() {
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
                                        owner: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const entities: ActionSetEntity[] = [];

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
                    total: 0,
                    max_score: 1,
                    hits: [],
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
});
