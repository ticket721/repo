import { EVMAntennaMergerScheduler, EVMProcessableEvent } from '@app/worker/evmantenna/EVMAntennaMerger.scheduler';
import { InstanceSignature, OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { Schedule } from 'nest-schedule';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { EVMEventSetsService } from '@lib/common/evmeventsets/EVMEventSets.service';
import { EVMBlockRollbacksService } from '@lib/common/evmblockrollbacks/EVMBlockRollbacks.service';
import { ShutdownService }                                      from '@lib/common/shutdown/Shutdown.service';
import { Job, JobOptions }                                      from 'bull';
import { anyFunction, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test, TestingModule }                                  from '@nestjs/testing';
import { getQueueToken }                                        from '@nestjs/bull';
import { getConnectionToken }                                   from '@iaminfinity/express-cassandra/dist/utils/cassandra-orm.utils';
import { Appender, EVMEventControllerBase }                     from '@app/worker/evmantenna/EVMEvent.controller.base';
import { GlobalEntity }                                         from '@lib/common/globalconfig/entities/Global.entity';
import { DryResponse }                                          from '@lib/common/crud/CRUDExtension.base';
import { ESSearchReturn }                                       from '@lib/common/utils/ESSearchReturn.type';
import { EVMEvent, EVMEventSetEntity }                          from '@lib/common/evmeventsets/entities/EVMEventSet.entity';
import { NestError }                                            from '@lib/common/utils/NestError';

class QueueMock<T = any> {
    add(name: string, data: T, opts?: JobOptions): Promise<Job<T>> {
        return null;
    }
    getJobs(...args: any[]): Promise<any> {
        return null;
    }
    process(...args: any[]): Promise<any> {
        return null;
    }
}

class ConnectionMock {
    doBatchAsync(...args: any[]): Promise<any> {
        return null;
    }
}

describe('EVMAntenna Merger Scheduler', function() {
    const context: {
        evmAntennaMergerScheduler: EVMAntennaMergerScheduler;
        outrospectionServiceMock: OutrospectionService;
        scheduleMock: Schedule;
        globalConfigServiceMock: GlobalConfigService;
        evmEventSetsServiceMock: EVMEventSetsService;
        evmBlockRollbacksServiceMock: EVMBlockRollbacksService;
        shutdownServiceMock: ShutdownService;
        queueMock: QueueMock;
        connectionMock: ConnectionMock;
        newGroupEventControllerMock: EVMEventControllerBase;
    } = {
        evmAntennaMergerScheduler: null,
        outrospectionServiceMock: null,
        scheduleMock: null,
        globalConfigServiceMock: null,
        evmEventSetsServiceMock: null,
        evmBlockRollbacksServiceMock: null,
        shutdownServiceMock: null,
        queueMock: null,
        connectionMock: null,
        newGroupEventControllerMock: null,
    };

    beforeAll(async function() {
        context.newGroupEventControllerMock = mock(EVMEventControllerBase);

        when(context.newGroupEventControllerMock.eventName).thenReturn('NewGroup');
        when(context.newGroupEventControllerMock.artifactName).thenReturn('T721Controller_v0');
        when(context.newGroupEventControllerMock.isHandler('NewGroup', 'T721Controller_v0')).thenReturn(true);

        EVMAntennaMergerScheduler.registerEVMEventsController(instance(context.newGroupEventControllerMock));
    });

    beforeEach(async function() {
        context.outrospectionServiceMock = mock(OutrospectionService);
        context.scheduleMock = mock(Schedule);
        context.globalConfigServiceMock = mock(GlobalConfigService);
        context.evmEventSetsServiceMock = mock(EVMEventSetsService);
        context.evmBlockRollbacksServiceMock = mock(EVMBlockRollbacksService);
        context.shutdownServiceMock = mock(ShutdownService);
        context.queueMock = mock(QueueMock);
        context.connectionMock = mock(ConnectionMock);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: OutrospectionService,
                    useValue: instance(context.outrospectionServiceMock),
                },
                {
                    provide: 'NEST_SCHEDULE_PROVIDER',
                    useValue: instance(context.scheduleMock),
                },
                {
                    provide: GlobalConfigService,
                    useValue: instance(context.globalConfigServiceMock),
                },
                {
                    provide: EVMEventSetsService,
                    useValue: instance(context.evmEventSetsServiceMock),
                },
                {
                    provide: EVMBlockRollbacksService,
                    useValue: instance(context.evmBlockRollbacksServiceMock),
                },
                {
                    provide: ShutdownService,
                    useValue: instance(context.shutdownServiceMock),
                },
                {
                    provide: getQueueToken('evmantenna'),
                    useValue: instance(context.queueMock),
                },
                {
                    provide: getConnectionToken(),
                    useValue: instance(context.connectionMock),
                },
                EVMAntennaMergerScheduler,
            ],
        }).compile();

        context.evmAntennaMergerScheduler = module.get<EVMAntennaMergerScheduler>(EVMAntennaMergerScheduler);
    });

    describe('registerEVMEventsControllers', function() {
        it('should check what has been done in beforeAll hook', async function() {
            expect((EVMAntennaMergerScheduler as any).controllers).toHaveLength(1);
            expect(
                (EVMAntennaMergerScheduler as any).controllers[0].isHandler('NewGroup', 'T721Controller_v0'),
            ).toBeTruthy();
        });
    });

    describe('evmEventMergerPoller', function() {
        it('should add block merging task to queue', async function() {
            const globalEntity: GlobalEntity = {
                processed_block_number: 99,
                block_number: 100,
            } as GlobalEntity;

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalEntity],
            });

            when(context.queueMock.getJobs(deepEqual(['waiting', 'active']))).thenResolve([]);

            await context.evmAntennaMergerScheduler.evmEventMergerPoller();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();

            verify(context.queueMock.getJobs(deepEqual(['waiting', 'active']))).called();

            verify(
                context.queueMock.add(
                    `@@evmeventset/evmEventMerger`,
                    deepEqual({
                        blockNumber: 100,
                    }),
                ),
            ).called();
        });

        it('should not add task as processing is up to date', async function() {
            const globalEntity: GlobalEntity = {
                processed_block_number: 100,
                block_number: 100,
            } as GlobalEntity;

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalEntity],
            });

            await context.evmAntennaMergerScheduler.evmEventMergerPoller();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();
        });

        it('should not add task as job already running', async function() {
            const globalEntity: GlobalEntity = {
                processed_block_number: 99,
                block_number: 100,
            } as GlobalEntity;

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalEntity],
            });

            when(context.queueMock.getJobs(deepEqual(['waiting', 'active']))).thenResolve([
                {
                    name: `@@evmeventset/evmEventMerger`,
                },
            ]);

            await context.evmAntennaMergerScheduler.evmEventMergerPoller();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();

            verify(context.queueMock.getJobs(deepEqual(['waiting', 'active']))).called();

            verify(
                context.queueMock.add(
                    `@@evmeventset/evmEventMerger`,
                    deepEqual({
                        blockNumber: 100,
                    }),
                ),
            ).never();
        });

        it('should fail and shutdown on global config fetch error', async function() {
            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(context.evmAntennaMergerScheduler.evmEventMergerPoller()).rejects.toMatchObject(
                new NestError(
                    `EVMAntennaMergerScheduler::evmEventMergerPoller | Unable to recover global config: unexpected_error`,
                ),
            );

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(
                        new NestError(
                            `EVMAntennaMergerScheduler::evmEventMergerPoller | Unable to recover global config: unexpected_error`,
                        ),
                    ),
                ),
            ).called();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();
        });

        it('should fail and shutdown on global config empty fetch', async function() {
            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            await expect(context.evmAntennaMergerScheduler.evmEventMergerPoller()).rejects.toMatchObject(
                new NestError(
                    `EVMAntennaMergerScheduler::evmEventMergerPoller | Unable to recover global config: no document found`,
                ),
            );

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(
                        new NestError(
                            `EVMAntennaMergerScheduler::evmEventMergerPoller | Unable to recover global config: no document found`,
                        ),
                    ),
                ),
            ).called();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();
        });
    });

    describe('appender', function() {
        it('should append/unshift in both arrays', function() {
            const queries = ([1] as any) as DryResponse[];

            const rollbacks = ([1] as any) as DryResponse[];

            const query = {
                query: 'hi',
                params: [42],
            };

            const rollback = {
                query: 'bye',
                params: [24],
            };

            context.evmAntennaMergerScheduler.appender(queries, rollbacks, query, rollback);

            expect(queries).toEqual([
                1,
                {
                    query: 'hi',
                    params: [42],
                },
            ]);

            expect(rollbacks).toEqual([
                {
                    query: 'bye',
                    params: [24],
                },
                1,
            ]);
        });

        it('should throw on null query', async function() {
            const queries = ([1] as any) as DryResponse[];

            const rollbacks = ([1] as any) as DryResponse[];

            const query = null;

            const rollback = {
                query: 'bye',
                params: [24],
            };

            expect(() => context.evmAntennaMergerScheduler.appender(queries, rollbacks, query, rollback)).toThrow(
                new NestError(`Cannot have asymmetric updates: each query must have its rollback !`),
            );
        });

        it('should throw on null rollback', function() {
            const queries = ([1] as any) as DryResponse[];

            const rollbacks = ([1] as any) as DryResponse[];

            const query = {
                query: 'hi',
                params: [42],
            };

            const rollback = null;

            expect(() => context.evmAntennaMergerScheduler.appender(queries, rollbacks, query, rollback)).toThrow(
                new NestError(`Cannot have asymmetric updates: each query must have its rollback !`),
            );
        });
    });

    describe('evmEventMerger', function() {
        it('should properly emit batched query. One event, no sorting.', async function() {
            const blockNumber = 99;
            const artifactName = 'T721Controller_v0';
            const eventName = 'NewGroup';

            const events = [
                ({
                    id: 'abcd',
                    artifact_name: artifactName,
                    event: eventName,
                } as any) as EVMEvent,
            ];

            // fetchEvmEventSets

            const esQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    block_number: blockNumber,
                                },
                            },
                        },
                    },
                },
            };

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: null,
                response: {
                    hits: {
                        total: 1,
                        hits: [
                            {
                                _source: {
                                    artifact_name: artifactName,
                                    events,
                                },
                            },
                        ],
                    },
                } as ESSearchReturn<EVMEventSetEntity>,
            });

            // convertEventsToQueries

            when(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[0] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).thenCall(
                async (event: EVMProcessableEvent, appender: Appender): Promise<void> => {
                    const query = {
                        query: 'forward 0',
                        params: [42],
                    };

                    const rollback = {
                        query: 'rollback 0',
                        params: [24],
                    };

                    appender(query, rollback);
                },
            );

            // injectEventSetDeletionQueries

            when(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: artifactName,
                        event_name: eventName,
                        block_number: blockNumber,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'delete block events',
                    params: [123],
                },
            });

            // injectProcessedHeightUpdateQuery

            when(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: blockNumber,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'processed height update',
                    params: [321],
                },
            });

            // injectBlockRollbackCreationQuery

            when(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: blockNumber,
                        rollback_queries: [
                            {
                                query: 'rollback 0',
                                params: [24],
                            },
                        ],
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'rollback pack',
                    params: [
                        42,
                        [
                            {
                                query: 'rollback packed',
                                params: ['pack', 123, { packed: true }],
                            },
                        ],
                    ],
                },
            });

            // Atomic batched insert

            when(
                context.connectionMock.doBatchAsync(
                    deepEqual([
                        {
                            query: 'forward 0',
                            params: [42],
                        },
                        {
                            query: 'delete block events',
                            params: [123],
                        },
                        {
                            query: 'processed height update',
                            params: [321],
                        },
                        {
                            query: 'rollback pack',
                            params: [
                                42,
                                [
                                    {
                                        query: 'rollback packed',
                                        params: ['pack', 123, { packed: true }],
                                    },
                                ],
                            ],
                        },
                    ]),
                ),
            ).thenResolve();

            // Call

            await context.evmAntennaMergerScheduler.evmEventMerger({
                data: {
                    blockNumber,
                },
            } as Job);

            // Verifications

            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(esQuery))).called();

            // convertEventsToQueries

            verify(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[0] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).called();

            // injectEventSetDeletionQueries

            verify(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: artifactName,
                        event_name: eventName,
                        block_number: blockNumber,
                    }),
                ),
            ).called();

            // injectProcessedHeightUpdateQuery

            verify(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: blockNumber,
                    }),
                ),
            ).called();

            // injectBlockRollbackCreationQuery

            verify(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: blockNumber,
                        rollback_queries: [
                            {
                                query: 'rollback 0',
                                params: [24],
                            },
                        ],
                    }),
                ),
            ).called();

            // Atomic batched insert

            verify(
                context.connectionMock.doBatchAsync(
                    deepEqual([
                        {
                            query: 'forward 0',
                            params: [42],
                        },
                        {
                            query: 'delete block events',
                            params: [123],
                        },
                        {
                            query: 'processed height update',
                            params: [321],
                        },
                        {
                            query: 'rollback pack',
                            params: [
                                42,
                                [
                                    {
                                        query: 'rollback packed',
                                        params: ['pack', '123', JSON.stringify({ packed: true })],
                                    },
                                ],
                            ],
                        },
                    ]),
                ),
            ).called();
        });

        it('should properly emit batched query. Three events, tx and log sorting.', async function() {
            const blockNumber = 99;
            const artifactName = 'T721Controller_v0';
            const eventName = 'NewGroup';

            const events = [
                ({
                    id: 'abcd1',
                    artifact_name: artifactName,
                    event: eventName,
                    transaction_index: 1,
                    log_index: 1,
                } as any) as EVMEvent,
                ({
                    id: 'abcd2',
                    artifact_name: artifactName,
                    event: eventName,
                    transaction_index: 1,
                    log_index: 0,
                } as any) as EVMEvent,
                ({
                    id: 'abcd3',
                    artifact_name: artifactName,
                    event: eventName,
                    transaction_index: 0,
                    log_index: 0,
                } as any) as EVMEvent,
            ];

            // fetchEvmEventSets

            const esQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    block_number: blockNumber,
                                },
                            },
                        },
                    },
                },
            };

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: null,
                response: {
                    hits: {
                        total: 1,
                        hits: [
                            {
                                _source: {
                                    artifact_name: artifactName,
                                    events,
                                },
                            },
                        ],
                    },
                } as ESSearchReturn<EVMEventSetEntity>,
            });

            // convertEventsToQueries

            when(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[0] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).thenCall(
                async (event: EVMProcessableEvent, appender: Appender): Promise<void> => {
                    const query = {
                        query: 'forward 0',
                        params: [42],
                    };

                    const rollback = {
                        query: 'rollback 0',
                        params: [24],
                    };

                    appender(query, rollback);
                },
            );

            when(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[1] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).thenCall(
                async (event: EVMProcessableEvent, appender: Appender): Promise<void> => {
                    const query = {
                        query: 'forward 1',
                        params: [42],
                    };

                    const rollback = {
                        query: 'rollback 1',
                        params: [24],
                    };

                    appender(query, rollback);
                },
            );

            when(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[2] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).thenCall(
                async (event: EVMProcessableEvent, appender: Appender): Promise<void> => {
                    const query = {
                        query: 'forward 2',
                        params: [42],
                    };

                    const rollback = {
                        query: 'rollback 2',
                        params: [24],
                    };

                    appender(query, rollback);
                },
            );

            // injectEventSetDeletionQueries

            when(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: artifactName,
                        event_name: eventName,
                        block_number: blockNumber,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'delete block events',
                    params: [123],
                },
            });

            // injectProcessedHeightUpdateQuery

            when(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: blockNumber,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'processed height update',
                    params: [321],
                },
            });

            // injectBlockRollbackCreationQuery

            when(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: blockNumber,
                        rollback_queries: [
                            {
                                query: 'rollback 0',
                                params: [24],
                            },
                            {
                                query: 'rollback 1',
                                params: [24],
                            },
                            {
                                query: 'rollback 2',
                                params: [24],
                            },
                        ],
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'rollback pack',
                    params: [
                        42,
                        [
                            {
                                query: 'rollback packed',
                                params: ['pack', 123, { packed: true }],
                            },
                        ],
                    ],
                },
            });

            // Atomic batched insert

            when(
                context.connectionMock.doBatchAsync(
                    deepEqual([
                        {
                            query: 'forward 2',
                            params: [42],
                        },
                        {
                            query: 'forward 1',
                            params: [42],
                        },
                        {
                            query: 'forward 0',
                            params: [42],
                        },
                        {
                            query: 'delete block events',
                            params: [123],
                        },
                        {
                            query: 'processed height update',
                            params: [321],
                        },
                        {
                            query: 'rollback pack',
                            params: [
                                42,
                                [
                                    {
                                        query: 'rollback packed',
                                        params: ['pack', 123, { packed: true }],
                                    },
                                ],
                            ],
                        },
                    ]),
                ),
            ).thenResolve();

            // Call

            await context.evmAntennaMergerScheduler.evmEventMerger({
                data: {
                    blockNumber,
                },
            } as Job);

            // Verifications

            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(esQuery))).called();

            // convertEventsToQueries

            verify(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[0] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).called();
            verify(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[1] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).called();
            verify(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[2] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).called();

            // injectEventSetDeletionQueries

            verify(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: artifactName,
                        event_name: eventName,
                        block_number: blockNumber,
                    }),
                ),
            ).called();

            // injectProcessedHeightUpdateQuery

            verify(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: blockNumber,
                    }),
                ),
            ).called();

            // injectBlockRollbackCreationQuery

            verify(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: blockNumber,
                        rollback_queries: [
                            {
                                query: 'rollback 0',
                                params: [24],
                            },
                            {
                                query: 'rollback 1',
                                params: [24],
                            },
                            {
                                query: 'rollback 2',
                                params: [24],
                            },
                        ],
                    }),
                ),
            ).called();

            // Atomic batched insert

            verify(
                context.connectionMock.doBatchAsync(
                    deepEqual([
                        {
                            query: 'forward 2',
                            params: [42],
                        },
                        {
                            query: 'forward 1',
                            params: [42],
                        },
                        {
                            query: 'forward 0',
                            params: [42],
                        },
                        {
                            query: 'delete block events',
                            params: [123],
                        },
                        {
                            query: 'processed height update',
                            params: [321],
                        },
                        {
                            query: 'rollback pack',
                            params: [
                                42,
                                [
                                    {
                                        query: 'rollback packed',
                                        params: ['pack', '123', JSON.stringify({ packed: true })],
                                    },
                                ],
                            ],
                        },
                    ]),
                ),
            ).called();
        });

        it('should fail on evm event set fatch error', async function() {
            const blockNumber = 99;

            // fetchEvmEventSets

            const esQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    block_number: blockNumber,
                                },
                            },
                        },
                    },
                },
            };

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // Call

            await expect(
                context.evmAntennaMergerScheduler.evmEventMerger({
                    data: {
                        blockNumber,
                    },
                } as Job),
            ).rejects.toMatchObject(
                new NestError(
                    `EVMAntennaMergerScheduler::fetchEvmEventSets | Error while fetching events for block 99: unexpected_error`,
                ),
            );

            // Verifications

            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(esQuery))).called();
        });

        it('should interupt on invalid evm event set count', async function() {
            const blockNumber = 99;

            // fetchEvmEventSets

            const esQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    block_number: blockNumber,
                                },
                            },
                        },
                    },
                },
            };

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: null,
                response: {
                    hits: {
                        total: 0,
                        hits: [],
                    },
                } as ESSearchReturn<EVMEventSetEntity>,
            });

            // Call

            await context.evmAntennaMergerScheduler.evmEventMerger({
                data: {
                    blockNumber,
                },
            } as Job);

            // Verifications

            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(esQuery))).called();
        });

        it('should fail for unmatching controllers', async function() {
            const blockNumber = 99;
            const artifactName = 'T721Controller_v1';
            const eventName = 'NewGroup';

            const events = [
                ({
                    id: 'abcd1',
                    artifact_name: artifactName,
                    event: eventName,
                    transaction_index: 1,
                    log_index: 1,
                } as any) as EVMEvent,
                ({
                    id: 'abcd2',
                    artifact_name: artifactName,
                    event: eventName,
                    transaction_index: 1,
                    log_index: 0,
                } as any) as EVMEvent,
                ({
                    id: 'abcd3',
                    artifact_name: artifactName,
                    event: eventName,
                    transaction_index: 0,
                    log_index: 0,
                } as any) as EVMEvent,
            ];

            // fetchEvmEventSets

            const esQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    block_number: blockNumber,
                                },
                            },
                        },
                    },
                },
            };

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: null,
                response: {
                    hits: {
                        total: 1,
                        hits: [
                            {
                                _source: {
                                    artifact_name: artifactName,
                                    events,
                                },
                            },
                        ],
                    },
                } as ESSearchReturn<EVMEventSetEntity>,
            });

            // Call

            await expect(
                context.evmAntennaMergerScheduler.evmEventMerger({
                    data: {
                        blockNumber,
                    },
                } as Job),
            ).rejects.toMatchObject(
                new NestError(
                    `EVMAntennaMergerScheduler::convertEventsToQueries | event NewGroup from T721Controller_v1 has no matching controller`,
                ),
            );

            // Verifications

            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(esQuery))).called();
        });

        it('should fail on eventset deletion query generation error', async function() {
            const blockNumber = 99;
            const artifactName = 'T721Controller_v0';
            const eventName = 'NewGroup';

            const events = [
                ({
                    id: 'abcd1',
                    artifact_name: artifactName,
                    event: eventName,
                    transaction_index: 1,
                    log_index: 1,
                } as any) as EVMEvent,
                ({
                    id: 'abcd2',
                    artifact_name: artifactName,
                    event: eventName,
                    transaction_index: 1,
                    log_index: 0,
                } as any) as EVMEvent,
                ({
                    id: 'abcd3',
                    artifact_name: artifactName,
                    event: eventName,
                    transaction_index: 0,
                    log_index: 0,
                } as any) as EVMEvent,
            ];

            // fetchEvmEventSets

            const esQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    block_number: blockNumber,
                                },
                            },
                        },
                    },
                },
            };

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: null,
                response: {
                    hits: {
                        total: 1,
                        hits: [
                            {
                                _source: {
                                    artifact_name: artifactName,
                                    events,
                                },
                            },
                        ],
                    },
                } as ESSearchReturn<EVMEventSetEntity>,
            });

            // convertEventsToQueries

            when(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[0] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).thenCall(
                async (event: EVMProcessableEvent, appender: Appender): Promise<void> => {
                    const query = {
                        query: 'forward 0',
                        params: [42],
                    };

                    const rollback = {
                        query: 'rollback 0',
                        params: [24],
                    };

                    appender(query, rollback);
                },
            );

            when(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[1] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).thenCall(
                async (event: EVMProcessableEvent, appender: Appender): Promise<void> => {
                    const query = {
                        query: 'forward 1',
                        params: [42],
                    };

                    const rollback = {
                        query: 'rollback 1',
                        params: [24],
                    };

                    appender(query, rollback);
                },
            );

            when(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[2] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).thenCall(
                async (event: EVMProcessableEvent, appender: Appender): Promise<void> => {
                    const query = {
                        query: 'forward 2',
                        params: [42],
                    };

                    const rollback = {
                        query: 'rollback 2',
                        params: [24],
                    };

                    appender(query, rollback);
                },
            );

            // injectEventSetDeletionQueries

            when(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: artifactName,
                        event_name: eventName,
                        block_number: blockNumber,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // Call

            await expect(
                context.evmAntennaMergerScheduler.evmEventMerger({
                    data: {
                        blockNumber,
                    },
                } as Job),
            ).rejects.toMatchObject(
                new NestError(
                    `EVMAntennaMergerScheduler::injectEventSetDeletionQueries | error while creating evmeventset removal on event NewGroup on controller T721Controller_v0`,
                ),
            );

            // Verifications

            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(esQuery))).called();

            // convertEventsToQueries

            verify(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[0] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).called();
            verify(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[1] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).called();
            verify(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[2] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).called();

            // injectEventSetDeletionQueries

            verify(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: artifactName,
                        event_name: eventName,
                        block_number: blockNumber,
                    }),
                ),
            ).called();
        });

        it('should fail on processed height update query generation error', async function() {
            const blockNumber = 99;
            const artifactName = 'T721Controller_v0';
            const eventName = 'NewGroup';

            const events = [
                ({
                    id: 'abcd1',
                    artifact_name: artifactName,
                    event: eventName,
                    transaction_index: 1,
                    log_index: 1,
                } as any) as EVMEvent,
                ({
                    id: 'abcd2',
                    artifact_name: artifactName,
                    event: eventName,
                    transaction_index: 1,
                    log_index: 0,
                } as any) as EVMEvent,
                ({
                    id: 'abcd3',
                    artifact_name: artifactName,
                    event: eventName,
                    transaction_index: 0,
                    log_index: 0,
                } as any) as EVMEvent,
            ];

            // fetchEvmEventSets

            const esQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    block_number: blockNumber,
                                },
                            },
                        },
                    },
                },
            };

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: null,
                response: {
                    hits: {
                        total: 1,
                        hits: [
                            {
                                _source: {
                                    artifact_name: artifactName,
                                    events,
                                },
                            },
                        ],
                    },
                } as ESSearchReturn<EVMEventSetEntity>,
            });

            // convertEventsToQueries

            when(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[0] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).thenCall(
                async (event: EVMProcessableEvent, appender: Appender): Promise<void> => {
                    const query = {
                        query: 'forward 0',
                        params: [42],
                    };

                    const rollback = {
                        query: 'rollback 0',
                        params: [24],
                    };

                    appender(query, rollback);
                },
            );

            when(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[1] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).thenCall(
                async (event: EVMProcessableEvent, appender: Appender): Promise<void> => {
                    const query = {
                        query: 'forward 1',
                        params: [42],
                    };

                    const rollback = {
                        query: 'rollback 1',
                        params: [24],
                    };

                    appender(query, rollback);
                },
            );

            when(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[2] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).thenCall(
                async (event: EVMProcessableEvent, appender: Appender): Promise<void> => {
                    const query = {
                        query: 'forward 2',
                        params: [42],
                    };

                    const rollback = {
                        query: 'rollback 2',
                        params: [24],
                    };

                    appender(query, rollback);
                },
            );

            // injectEventSetDeletionQueries

            when(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: artifactName,
                        event_name: eventName,
                        block_number: blockNumber,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'delete block events',
                    params: [123],
                },
            });

            // injectProcessedHeightUpdateQuery

            when(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: blockNumber,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // Call

            await expect(
                context.evmAntennaMergerScheduler.evmEventMerger({
                    data: {
                        blockNumber,
                    },
                } as Job),
            ).rejects.toMatchObject(
                new NestError(
                    `EVMAntennaMergerScheduler::evmEventMerger | error while creating global config update query: unexpected_error`,
                ),
            );

            // Verifications

            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(esQuery))).called();

            // convertEventsToQueries

            verify(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[0] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).called();
            verify(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[1] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).called();
            verify(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[2] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).called();

            // injectEventSetDeletionQueries

            verify(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: artifactName,
                        event_name: eventName,
                        block_number: blockNumber,
                    }),
                ),
            ).called();

            // injectProcessedHeightUpdateQuery

            verify(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: blockNumber,
                    }),
                ),
            ).called();
        });

        it('should fail on block rollback creation query generation error', async function() {
            const blockNumber = 99;
            const artifactName = 'T721Controller_v0';
            const eventName = 'NewGroup';

            const events = [
                ({
                    id: 'abcd1',
                    artifact_name: artifactName,
                    event: eventName,
                    transaction_index: 1,
                    log_index: 1,
                } as any) as EVMEvent,
                ({
                    id: 'abcd2',
                    artifact_name: artifactName,
                    event: eventName,
                    transaction_index: 1,
                    log_index: 0,
                } as any) as EVMEvent,
                ({
                    id: 'abcd3',
                    artifact_name: artifactName,
                    event: eventName,
                    transaction_index: 0,
                    log_index: 0,
                } as any) as EVMEvent,
            ];

            // fetchEvmEventSets

            const esQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    block_number: blockNumber,
                                },
                            },
                        },
                    },
                },
            };

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: null,
                response: {
                    hits: {
                        total: 1,
                        hits: [
                            {
                                _source: {
                                    artifact_name: artifactName,
                                    events,
                                },
                            },
                        ],
                    },
                } as ESSearchReturn<EVMEventSetEntity>,
            });

            // convertEventsToQueries

            when(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[0] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).thenCall(
                async (event: EVMProcessableEvent, appender: Appender): Promise<void> => {
                    const query = {
                        query: 'forward 0',
                        params: [42],
                    };

                    const rollback = {
                        query: 'rollback 0',
                        params: [24],
                    };

                    appender(query, rollback);
                },
            );

            when(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[1] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).thenCall(
                async (event: EVMProcessableEvent, appender: Appender): Promise<void> => {
                    const query = {
                        query: 'forward 1',
                        params: [42],
                    };

                    const rollback = {
                        query: 'rollback 1',
                        params: [24],
                    };

                    appender(query, rollback);
                },
            );

            when(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[2] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).thenCall(
                async (event: EVMProcessableEvent, appender: Appender): Promise<void> => {
                    const query = {
                        query: 'forward 2',
                        params: [42],
                    };

                    const rollback = {
                        query: 'rollback 2',
                        params: [24],
                    };

                    appender(query, rollback);
                },
            );

            // injectEventSetDeletionQueries

            when(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: artifactName,
                        event_name: eventName,
                        block_number: blockNumber,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'delete block events',
                    params: [123],
                },
            });

            // injectProcessedHeightUpdateQuery

            when(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: blockNumber,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'processed height update',
                    params: [321],
                },
            });

            // injectBlockRollbackCreationQuery

            when(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: blockNumber,
                        rollback_queries: [
                            {
                                query: 'rollback 0',
                                params: [24],
                            },
                            {
                                query: 'rollback 1',
                                params: [24],
                            },
                            {
                                query: 'rollback 2',
                                params: [24],
                            },
                        ],
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // Call

            await expect(
                context.evmAntennaMergerScheduler.evmEventMerger({
                    data: {
                        blockNumber,
                    },
                } as Job),
            ).rejects.toMatchObject(
                new NestError(
                    `EVMAntennaMergerScheduler::injectBlockRollbackCreationQuery | error while creating block rollback query: unexpected_error`,
                ),
            );

            // Verifications

            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(esQuery))).called();

            // convertEventsToQueries

            verify(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[0] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).called();
            verify(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[1] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).called();
            verify(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[2] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).called();

            // injectEventSetDeletionQueries

            verify(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: artifactName,
                        event_name: eventName,
                        block_number: blockNumber,
                    }),
                ),
            ).called();

            // injectProcessedHeightUpdateQuery

            verify(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: blockNumber,
                    }),
                ),
            ).called();

            // injectBlockRollbackCreationQuery

            verify(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: blockNumber,
                        rollback_queries: [
                            {
                                query: 'rollback 0',
                                params: [24],
                            },
                            {
                                query: 'rollback 1',
                                params: [24],
                            },
                            {
                                query: 'rollback 2',
                                params: [24],
                            },
                        ],
                    }),
                ),
            ).called();
        });

        it('should fail on batched insert throw', async function() {
            const blockNumber = 99;
            const artifactName = 'T721Controller_v0';
            const eventName = 'NewGroup';

            const events = [
                ({
                    id: 'abcd1',
                    artifact_name: artifactName,
                    event: eventName,
                    transaction_index: 1,
                    log_index: 1,
                } as any) as EVMEvent,
                ({
                    id: 'abcd2',
                    artifact_name: artifactName,
                    event: eventName,
                    transaction_index: 1,
                    log_index: 0,
                } as any) as EVMEvent,
                ({
                    id: 'abcd3',
                    artifact_name: artifactName,
                    event: eventName,
                    transaction_index: 0,
                    log_index: 0,
                } as any) as EVMEvent,
            ];

            // fetchEvmEventSets

            const esQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    block_number: blockNumber,
                                },
                            },
                        },
                    },
                },
            };

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: null,
                response: {
                    hits: {
                        total: 1,
                        hits: [
                            {
                                _source: {
                                    artifact_name: artifactName,
                                    events,
                                },
                            },
                        ],
                    },
                } as ESSearchReturn<EVMEventSetEntity>,
            });

            // convertEventsToQueries

            when(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[0] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).thenCall(
                async (event: EVMProcessableEvent, appender: Appender): Promise<void> => {
                    const query = {
                        query: 'forward 0',
                        params: [42],
                    };

                    const rollback = {
                        query: 'rollback 0',
                        params: [24],
                    };

                    appender(query, rollback);
                },
            );

            when(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[1] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).thenCall(
                async (event: EVMProcessableEvent, appender: Appender): Promise<void> => {
                    const query = {
                        query: 'forward 1',
                        params: [42],
                    };

                    const rollback = {
                        query: 'rollback 1',
                        params: [24],
                    };

                    appender(query, rollback);
                },
            );

            when(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[2] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).thenCall(
                async (event: EVMProcessableEvent, appender: Appender): Promise<void> => {
                    const query = {
                        query: 'forward 2',
                        params: [42],
                    };

                    const rollback = {
                        query: 'rollback 2',
                        params: [24],
                    };

                    appender(query, rollback);
                },
            );

            // injectEventSetDeletionQueries

            when(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: artifactName,
                        event_name: eventName,
                        block_number: blockNumber,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'delete block events',
                    params: [123],
                },
            });

            // injectProcessedHeightUpdateQuery

            when(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: blockNumber,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'processed height update',
                    params: [321],
                },
            });

            // injectBlockRollbackCreationQuery

            when(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: blockNumber,
                        rollback_queries: [
                            {
                                query: 'rollback 0',
                                params: [24],
                            },
                            {
                                query: 'rollback 1',
                                params: [24],
                            },
                            {
                                query: 'rollback 2',
                                params: [24],
                            },
                        ],
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'rollback pack',
                    params: [
                        42,
                        [
                            {
                                query: 'rollback packed',
                                params: ['pack', 123, { packed: true }],
                            },
                        ],
                    ],
                },
            });

            // Atomic batched insert

            when(
                context.connectionMock.doBatchAsync(
                    deepEqual([
                        {
                            query: 'forward 2',
                            params: [42],
                        },
                        {
                            query: 'forward 1',
                            params: [42],
                        },
                        {
                            query: 'forward 0',
                            params: [42],
                        },
                        {
                            query: 'delete block events',
                            params: [123],
                        },
                        {
                            query: 'processed height update',
                            params: [321],
                        },
                        {
                            query: 'rollback pack',
                            params: [
                                42,
                                [
                                    {
                                        query: 'rollback packed',
                                        params: ['pack', '123', JSON.stringify({ packed: true })],
                                    },
                                ],
                            ],
                        },
                    ]),
                ),
            ).thenReject(new NestError('insertion error'));

            // Call

            await expect(
                context.evmAntennaMergerScheduler.evmEventMerger({
                    data: {
                        blockNumber,
                    },
                } as Job),
            ).rejects.toMatchObject(new NestError('insertion error'));

            // Verifications

            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(esQuery))).called();

            // convertEventsToQueries

            verify(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[0] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).called();
            verify(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[1] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).called();
            verify(
                context.newGroupEventControllerMock.convert(
                    deepEqual((events[2] as any) as EVMProcessableEvent),
                    anyFunction(),
                ),
            ).called();

            // injectEventSetDeletionQueries

            verify(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: artifactName,
                        event_name: eventName,
                        block_number: blockNumber,
                    }),
                ),
            ).called();

            // injectProcessedHeightUpdateQuery

            verify(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: blockNumber,
                    }),
                ),
            ).called();

            // injectBlockRollbackCreationQuery

            verify(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: blockNumber,
                        rollback_queries: [
                            {
                                query: 'rollback 0',
                                params: [24],
                            },
                            {
                                query: 'rollback 1',
                                params: [24],
                            },
                            {
                                query: 'rollback 2',
                                params: [24],
                            },
                        ],
                    }),
                ),
            ).called();

            // Atomic batched insert

            verify(
                context.connectionMock.doBatchAsync(
                    deepEqual([
                        {
                            query: 'forward 2',
                            params: [42],
                        },
                        {
                            query: 'forward 1',
                            params: [42],
                        },
                        {
                            query: 'forward 0',
                            params: [42],
                        },
                        {
                            query: 'delete block events',
                            params: [123],
                        },
                        {
                            query: 'processed height update',
                            params: [321],
                        },
                        {
                            query: 'rollback pack',
                            params: [
                                42,
                                [
                                    {
                                        query: 'rollback packed',
                                        params: ['pack', '123', JSON.stringify({ packed: true })],
                                    },
                                ],
                            ],
                        },
                    ]),
                ),
            ).called();
        });
    });

    describe('onApplicationBootstrap', function() {
        it('should subscribe to all as worker master', async function() {
            const signature: InstanceSignature = {
                name: 'worker',
                master: true,
            } as InstanceSignature;

            when(context.outrospectionServiceMock.getInstanceSignature()).thenResolve(signature);
            when(context.queueMock.process(`@@evmeventset/evmEventMerger`, 1, anyFunction())).thenResolve();

            await context.evmAntennaMergerScheduler.onApplicationBootstrap();

            verify(context.scheduleMock.scheduleIntervalJob('evmEventMerger', 500, anyFunction())).called();
            verify(context.queueMock.process(`@@evmeventset/evmEventMerger`, 1, anyFunction())).called();
        });

        it('should subscribe to bull only as worker non master', async function() {
            const signature: InstanceSignature = {
                name: 'worker',
                master: false,
            } as InstanceSignature;

            when(context.outrospectionServiceMock.getInstanceSignature()).thenResolve(signature);
            when(context.queueMock.process(`@@evmeventset/evmEventMerger`, 1, anyFunction())).thenResolve();

            await context.evmAntennaMergerScheduler.onApplicationBootstrap();

            verify(context.scheduleMock.scheduleIntervalJob('evmEventMerger', 500, anyFunction())).never();
            verify(context.queueMock.process(`@@evmeventset/evmEventMerger`, 1, anyFunction())).called();
        });

        it('should subscribe to none as server non master', async function() {
            const signature: InstanceSignature = {
                name: 'server',
                master: false,
            } as InstanceSignature;

            when(context.outrospectionServiceMock.getInstanceSignature()).thenResolve(signature);
            when(context.queueMock.process(`@@evmeventset/evmEventMerger`, 1, anyFunction())).thenResolve();

            await context.evmAntennaMergerScheduler.onApplicationBootstrap();

            verify(context.scheduleMock.scheduleIntervalJob('evmEventMerger', 500, anyFunction())).never();
            verify(context.queueMock.process(`@@evmeventset/evmEventMerger`, 1, anyFunction())).never();
        });
    });
});
