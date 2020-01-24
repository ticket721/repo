import { ActionSetsScheduler } from '@lib/common/actionsets/ActionSets.scheduler';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { Job, JobOptions, Queue } from 'bull';
import {
    anything,
    capture,
    deepEqual,
    instance,
    mock,
    verify,
    when,
} from 'ts-mockito';
import { Schedule } from 'nest-schedule';
import {
    ActionSetStatus,
    ActionStatus,
    ActionType,
} from '@lib/common/actionsets/entities/ActionSet.entity';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';

describe('ActionSets Scheduler', function() {
    const context: {
        actionSetsScheduler: ActionSetsScheduler;
        actionSetsServiceMock: ActionSetsService;
        shutdownServiceMock: ShutdownService;
        actionQueueMock: Queue;
        scheduleMock: Schedule;
    } = {
        actionSetsScheduler: null,
        actionSetsServiceMock: null,
        shutdownServiceMock: null,
        actionQueueMock: null,
        scheduleMock: null,
    };

    beforeEach(async function() {
        context.actionSetsServiceMock = mock(ActionSetsService);
        context.actionQueueMock = mock<Queue>();
        context.shutdownServiceMock = mock(ShutdownService);
        context.scheduleMock = mock(Schedule);
        context.actionSetsScheduler = new ActionSetsScheduler(
            instance(context.actionSetsServiceMock),
            instance(context.shutdownServiceMock),
            instance(context.actionQueueMock),
            instance(context.scheduleMock),
            new WinstonLoggerService('actionset'),
        );
    });

    describe('inputDispatcher', function() {
        it('should fail fetching actionSets', async function() {
            when(
                context.actionSetsServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            size: 1000,
                            query: {
                                bool: {
                                    must: [
                                        {
                                            term: {
                                                current_status: 'input:waiting',
                                            },
                                        },
                                        {
                                            range: {
                                                dispatched_at: {
                                                    lt: 'now-5s',
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                response: null,
                error: 'unexpected error',
            });

            await context.actionSetsScheduler.inputDispatcher();

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new Error('Error while requesting action sets')),
                ),
            ).called();
            verify(
                context.actionSetsServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            size: 1000,
                            query: {
                                bool: {
                                    must: [
                                        {
                                            term: {
                                                current_status: 'input:waiting',
                                            },
                                        },
                                        {
                                            range: {
                                                dispatched_at: {
                                                    lt: 'now-5s',
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).called();
        });

        it('should dispatch only response', async function() {
            const create = new Date(Date.now());
            const update = new Date(Date.now());
            const dispatch = new Date(Date.now());

            const entity = {
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                name: 'test',
                current_status: 'input:in progress' as ActionSetStatus,
                owner: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                actions: [
                    {
                        error: null,
                        type: 'input' as ActionType,
                        name: 'first',
                        data: '{"name":"hello"}',
                        status: 'in progress' as ActionStatus,
                    },
                    {
                        error: null,
                        type: 'event' as ActionType,
                        name: 'second',
                        data: '{"name":"hello"}',
                        status: 'in progress' as ActionStatus,
                    },
                ],
                current_action: 0,
                dispatched_at: dispatch,
                updated_at: update,
                created_at: create,
            };

            when(
                context.actionSetsServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            size: 1000,
                            query: {
                                bool: {
                                    must: [
                                        {
                                            term: {
                                                current_status: 'input:waiting',
                                            },
                                        },
                                        {
                                            range: {
                                                dispatched_at: {
                                                    lt: 'now-5s',
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                response: {
                    hits: {
                        total: 2,
                        hits: [
                            {
                                _source: entity,
                            },
                        ],
                    },
                } as any,
                error: null,
            });

            when(
                context.actionQueueMock.add('input', deepEqual(entity)),
            ).thenResolve(void 0);
            when(
                context.actionQueueMock.getJobs(
                    deepEqual(['active', 'waiting']),
                ),
            ).thenResolve([]);
            when(
                context.actionSetsServiceMock.update(
                    deepEqual({
                        id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                    }),
                    deepEqual({
                        dispatched_at: anything(),
                    }),
                ),
            ).thenResolve({} as any);

            await context.actionSetsScheduler.inputDispatcher();

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new Error('Error while requesting action sets')),
                ),
            ).never();
            verify(
                context.actionSetsServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            size: 1000,
                            query: {
                                bool: {
                                    must: [
                                        {
                                            term: {
                                                current_status: 'input:waiting',
                                            },
                                        },
                                        {
                                            range: {
                                                dispatched_at: {
                                                    lt: 'now-5s',
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).called();
            verify(
                context.actionSetsServiceMock.update(
                    deepEqual({
                        id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                    }),
                    deepEqual({
                        dispatched_at: anything(),
                    }),
                ),
            ).called();
            verify(
                context.actionQueueMock.add('input', deepEqual(entity)),
            ).called();
            verify(
                context.actionQueueMock.getJobs(
                    deepEqual(['active', 'waiting']),
                ),
            ).called();
        });

        it('should skip only response', async function() {
            const create = new Date(Date.now());
            const update = new Date(Date.now());
            const dispatch = new Date(Date.now());

            const entity = {
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                name: 'test',
                current_status: 'input:in progress' as ActionSetStatus,
                owner: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                actions: [
                    {
                        error: null,
                        type: 'input' as ActionType,
                        name: 'first',
                        data: '{"name":"hello"}',
                        status: 'in progress' as ActionStatus,
                    },
                    {
                        error: null,
                        type: 'event' as ActionType,
                        name: 'second',
                        data: '{"name":"hello"}',
                        status: 'in progress' as ActionStatus,
                    },
                ],
                current_action: 0,
                dispatched_at: dispatch,
                updated_at: update,
                created_at: create,
            };

            when(
                context.actionSetsServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            size: 1000,
                            query: {
                                bool: {
                                    must: [
                                        {
                                            term: {
                                                current_status: 'input:waiting',
                                            },
                                        },
                                        {
                                            range: {
                                                dispatched_at: {
                                                    lt: 'now-5s',
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                response: {
                    hits: {
                        total: 2,
                        hits: [
                            {
                                _source: entity,
                            },
                        ],
                    },
                } as any,
                error: null,
            });

            when(
                context.actionQueueMock.add('input', deepEqual(entity)),
            ).thenResolve(void 0);
            when(
                context.actionQueueMock.getJobs(
                    deepEqual(['active', 'waiting']),
                ),
            ).thenResolve([
                {
                    data: entity,
                } as any,
            ]);
            when(
                context.actionSetsServiceMock.update(
                    deepEqual({
                        id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                    }),
                    deepEqual({
                        dispatched_at: anything(),
                    }),
                ),
            ).thenResolve({} as any);

            await context.actionSetsScheduler.inputDispatcher();

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new Error('Error while requesting action sets')),
                ),
            ).never();
            verify(
                context.actionSetsServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            size: 1000,
                            query: {
                                bool: {
                                    must: [
                                        {
                                            term: {
                                                current_status: 'input:waiting',
                                            },
                                        },
                                        {
                                            range: {
                                                dispatched_at: {
                                                    lt: 'now-5s',
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).called();
            verify(
                context.actionSetsServiceMock.update(
                    deepEqual({
                        id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                    }),
                    deepEqual({
                        dispatched_at: anything(),
                    }),
                ),
            ).never();
            verify(
                context.actionQueueMock.add('input', deepEqual(entity)),
            ).never();
            verify(
                context.actionQueueMock.getJobs(
                    deepEqual(['active', 'waiting']),
                ),
            ).called();
        });
    });
});
