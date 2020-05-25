import { Schedule } from 'nest-schedule';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { ActionSetsService }                       from '@lib/common/actionsets/ActionSets.service';
import { ShutdownService }                         from '@lib/common/shutdown/Shutdown.service';
import { getQueueToken }                           from '@nestjs/bull';
import { Job, JobOptions }                         from 'bull';
import { WinstonLoggerService }                    from '@lib/common/logger/WinstonLogger.service';
import { ActionSetsScheduler }                     from '@app/worker/schedulers/actionsets/ActionSets.scheduler';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test, TestingModule }                     from '@nestjs/testing';
import { TimeToolService }                         from '@lib/common/toolbox/Time.tool.service';
import { ESSearchReturn }                          from '@lib/common/utils/ESSearchReturn.type';
import { ActionSetEntity }                         from '@lib/common/actionsets/entities/ActionSet.entity';
import { NestError }                               from '@lib/common/utils/NestError';

class QueueMock<T = any> {
    add(name: string, data: T, opts?: JobOptions): Promise<Job<T>> {
        return null;
    }
    getJobs(...args: any[]): Promise<Job[]> {
        return null;
    }
}

describe('ActionSets Scheduler', function() {
    const context: {
        actionSetsScheduler: ActionSetsScheduler;
        scheduleMock: Schedule;
        outrospectionServiceMock: OutrospectionService;
        configServiceMock: ConfigService;
        actionSetsServiceMock: ActionSetsService;
        shutdownServiceMock: ShutdownService;
        actionQueueMock: QueueMock;
        loggerServiceMock: WinstonLoggerService;
        timeToolServiceMock: TimeToolService;
    } = {
        actionSetsScheduler: null,
        scheduleMock: null,
        outrospectionServiceMock: null,
        configServiceMock: null,
        actionSetsServiceMock: null,
        shutdownServiceMock: null,
        actionQueueMock: null,
        loggerServiceMock: null,
        timeToolServiceMock: null,
    };

    beforeEach(async function() {
        context.scheduleMock = mock(Schedule);
        context.outrospectionServiceMock = mock(OutrospectionService);
        context.configServiceMock = mock(ConfigService);
        context.actionSetsServiceMock = mock(ActionSetsService);
        context.shutdownServiceMock = mock(ShutdownService);
        context.actionQueueMock = mock(QueueMock);
        context.loggerServiceMock = mock(WinstonLoggerService);
        context.timeToolServiceMock = mock(TimeToolService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: 'NEST_SCHEDULE_PROVIDER',
                    useValue: instance(context.scheduleMock),
                },
                {
                    provide: OutrospectionService,
                    useValue: instance(context.outrospectionServiceMock),
                },
                {
                    provide: ConfigService,
                    useValue: instance(context.configServiceMock),
                },
                {
                    provide: ActionSetsService,
                    useValue: instance(context.actionSetsServiceMock),
                },
                {
                    provide: ShutdownService,
                    useValue: instance(context.shutdownServiceMock),
                },
                {
                    provide: getQueueToken('action'),
                    useValue: instance(context.actionQueueMock),
                },
                {
                    provide: WinstonLoggerService,
                    useValue: instance(context.loggerServiceMock),
                },
                {
                    provide: TimeToolService,
                    useValue: instance(context.timeToolServiceMock),
                },
                ActionSetsScheduler,
            ],
        }).compile();

        context.actionSetsScheduler = module.get<ActionSetsScheduler>(ActionSetsScheduler);
    });

    describe('eventDispatcher', function() {
        it('should fetch several action sets and dispatch them to queue', async function() {
            const batchSize = 1000;
            const now = new Date(Date.now());

            when(context.configServiceMock.get('ACSET_EVENT_BATCH_SIZE')).thenReturn(batchSize.toString());
            when(context.timeToolServiceMock.now()).thenReturn(now);

            const query = {
                body: {
                    size: 1000,
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        current_status: 'event:in progress',
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
            };

            const actionSets = [
                {
                    id: 'action_set_id',
                },
            ];

            when(context.actionSetsServiceMock.searchElastic(deepEqual(query))).thenResolve({
                error: null,
                response: {
                    hits: {
                        total: 1,
                        hits: [
                            {
                                _source: actionSets[0],
                            },
                        ],
                    },
                } as ESSearchReturn<ActionSetEntity>,
            });

            when(context.actionQueueMock.getJobs(deepEqual(['active', 'waiting']))).thenResolve([]);

            when(
                context.actionSetsServiceMock.update(
                    deepEqual({
                        id: 'action_set_id',
                    }),
                    deepEqual({
                        dispatched_at: now,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.actionSetsScheduler.eventDispatcher();

            verify(context.configServiceMock.get('ACSET_EVENT_BATCH_SIZE')).called();
            verify(context.timeToolServiceMock.now()).called();
            verify(context.actionSetsServiceMock.searchElastic(deepEqual(query))).called();
            verify(context.actionQueueMock.getJobs(deepEqual(['active', 'waiting']))).called();
            verify(
                context.actionSetsServiceMock.update(
                    deepEqual({
                        id: 'action_set_id',
                    }),
                    deepEqual({
                        dispatched_at: now,
                    }),
                ),
            ).called();

            verify(context.loggerServiceMock.log(`Dispatched 1 ActionSets on the event queue`)).called();
            verify(context.actionQueueMock.add('event', deepEqual(actionSets[0]))).called();
        });

        it('should fetch nothing', async function() {
            const batchSize = 1000;
            const now = new Date(Date.now());

            when(context.configServiceMock.get('ACSET_EVENT_BATCH_SIZE')).thenReturn(batchSize.toString());
            when(context.timeToolServiceMock.now()).thenReturn(now);

            const query = {
                body: {
                    size: 1000,
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        current_status: 'event:in progress',
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
            };

            when(context.actionSetsServiceMock.searchElastic(deepEqual(query))).thenResolve({
                error: null,
                response: {
                    hits: {
                        total: 0,
                        hits: [],
                    },
                } as ESSearchReturn<ActionSetEntity>,
            });

            await context.actionSetsScheduler.eventDispatcher();

            verify(context.configServiceMock.get('ACSET_EVENT_BATCH_SIZE')).called();
            verify(context.timeToolServiceMock.now()).called();
            verify(context.actionSetsServiceMock.searchElastic(deepEqual(query))).called();
        });

        it('should fail on action sets fetch error', async function() {
            const batchSize = 1000;
            const now = new Date(Date.now());

            when(context.configServiceMock.get('ACSET_EVENT_BATCH_SIZE')).thenReturn(batchSize.toString());
            when(context.timeToolServiceMock.now()).thenReturn(now);

            const query = {
                body: {
                    size: 1000,
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        current_status: 'event:in progress',
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
            };

            when(context.actionSetsServiceMock.searchElastic(deepEqual(query))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await context.actionSetsScheduler.eventDispatcher();

            verify(context.configServiceMock.get('ACSET_EVENT_BATCH_SIZE')).called();
            verify(context.actionSetsServiceMock.searchElastic(deepEqual(query))).called();
            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new NestError('Error while requesting action sets')),
                ),
            );
        });

        it('should not redispatch if already in queue', async function() {
            const batchSize = 1000;
            const now = new Date(Date.now());

            when(context.configServiceMock.get('ACSET_EVENT_BATCH_SIZE')).thenReturn(batchSize.toString());
            when(context.timeToolServiceMock.now()).thenReturn(now);

            const query = {
                body: {
                    size: 1000,
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        current_status: 'event:in progress',
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
            };

            const actionSets = [
                {
                    id: 'action_set_id',
                },
            ];

            when(context.actionSetsServiceMock.searchElastic(deepEqual(query))).thenResolve({
                error: null,
                response: {
                    hits: {
                        total: 1,
                        hits: [
                            {
                                _source: actionSets[0],
                            },
                        ],
                    },
                } as ESSearchReturn<ActionSetEntity>,
            });

            when(context.actionQueueMock.getJobs(deepEqual(['active', 'waiting']))).thenResolve([
                {
                    data: {
                        id: 'action_set_id',
                    },
                },
            ] as any);

            when(
                context.actionSetsServiceMock.update(
                    deepEqual({
                        id: 'action_set_id',
                    }),
                    deepEqual({
                        dispatched_at: now,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.actionSetsScheduler.eventDispatcher();

            verify(context.configServiceMock.get('ACSET_EVENT_BATCH_SIZE')).called();
            verify(context.timeToolServiceMock.now()).called();
            verify(context.actionSetsServiceMock.searchElastic(deepEqual(query))).called();
            verify(context.actionQueueMock.getJobs(deepEqual(['active', 'waiting']))).called();
            verify(
                context.actionSetsServiceMock.update(
                    deepEqual({
                        id: 'action_set_id',
                    }),
                    deepEqual({
                        dispatched_at: now,
                    }),
                ),
            ).never();

            verify(context.loggerServiceMock.log(`Dispatched 1 ActionSets on the event queue`)).never();
            verify(context.actionQueueMock.add('event', deepEqual(actionSets[0]))).never();
        });
    });
});
