import { EVMAntennaMergerScheduler, EVMProcessableEvent } from '@app/worker/evmantenna/EVMAntennaMerger.scheduler';
import { InstanceSignature, OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { Schedule } from 'nest-schedule';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { EVMEventSetsService } from '@lib/common/evmeventsets/EVMEventSets.service';
import { EVMBlockRollbacksService } from '@lib/common/evmblockrollbacks/EVMBlockRollbacks.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { Job, JobOptions } from 'bull';
import { anyFunction, anyNumber, anything, deepEqual, instance, mock, reset, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { getConnectionToken } from '@iaminfinity/express-cassandra/dist/utils/cassandra-orm.utils';
import { Appender, EVMEventControllerBase } from '@app/worker/evmantenna/EVMEvent.controller.base';
import { GlobalEntity } from '@lib/common/globalconfig/entities/Global.entity';
import { DryResponse } from '@lib/common/crud/CRUDExtension.base';
import { ESSearchHit, ESSearchReturn } from '@lib/common/utils/ESSearchReturn.type';
import { EVMEvent, EVMEventSetEntity } from '@lib/common/evmeventsets/entities/EVMEventSet.entity';
import { NestError } from '@lib/common/utils/NestError';

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

        reset(context.newGroupEventControllerMock);
        when(context.newGroupEventControllerMock.eventName).thenReturn('NewGroup');
        when(context.newGroupEventControllerMock.artifactName).thenReturn('T721Controller_v0');
        when(context.newGroupEventControllerMock.isHandler('NewGroup', 'T721Controller_v0')).thenReturn(true);

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

    describe('evmEventMergerPoller', function() {
        it('should properly merge events', async function() {
            const globalConfigEntity: GlobalEntity = {
                id: 'global',
                block_number: 12,
                processed_block_number: 10,
                eth_eur_price: 10000,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };
            const evmEventSetsQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                range: {
                                    block_number: {
                                        gte: 11,
                                        lte: 12,
                                    },
                                },
                            },
                        },
                    },
                },
            };
            const evmEventSetsResponse: ESSearchReturn<EVMEventSetEntity> = {
                took: 12,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    max_score: 1,
                    total: 2,
                    hits: [...Array(2).keys()].map(
                        (idx: number): ESSearchHit<EVMEventSetEntity> => ({
                            _index: 'idx',
                            _id: 'id',
                            _type: 'type',
                            _score: 1,
                            _source: {
                                artifact_name: 'T721Controller_v0',
                                event_name: 'NewGroup',
                                block_number: 11 + idx,
                                events: [
                                    {
                                        return_values: JSON.stringify({}),
                                        raw_data: 'raw_data',
                                        block_number: 11 + idx,
                                        raw_topics: ['raw_topics'],
                                        event: 'NewGroup',
                                        signature: 'signature',
                                        log_index: 0,
                                        transaction_index: 0,
                                        transaction_hash: 'transaction_hash',
                                        block_hash: 'block_hash',
                                        address: 'address',
                                    },
                                ],
                                created_at: new Date(Date.now()),
                                updated_at: new Date(Date.now()),
                            },
                        }),
                    ),
                },
            };
            const finalqueries = [
                { query: 'create event', params: [] },
                { query: 'rm this event', params: [] },
                { query: 'increase block number', params: [] },
                {
                    query: 'rollback query',
                    params: [
                        'hi',
                        [
                            { query: 'string', params: ['hi'] },
                            { query: 'number', params: ['12'] },
                            { query: 'object', params: ['{"hi":12}'] },
                        ],
                    ],
                },
                { query: 'create event', params: [] },
                { query: 'rm this event', params: [] },
                { query: 'increase block number', params: [] },
                {
                    query: 'rollback query',
                    params: [
                        'hi',
                        [
                            { query: 'string', params: ['hi'] },
                            { query: 'number', params: ['12'] },
                            { query: 'object', params: ['{"hi":12}'] },
                        ],
                    ],
                },
            ];

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalConfigEntity],
            });

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).thenResolve({
                error: null,
                response: evmEventSetsResponse,
            });

            when(context.newGroupEventControllerMock.convert(anything(), anyFunction())).thenCall(
                async (event: EVMProcessableEvent, append: Appender): Promise<void> => {
                    append(
                        {
                            query: `create event`,
                            params: [],
                        },

                        {
                            query: `delete event`,
                            params: [],
                        },
                    );
                },
            );

            when(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'rm this event',
                    params: [],
                },
            });

            when(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'increase block number',
                    params: [],
                },
            });

            when(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: anyNumber(),
                        rollback_queries: [
                            {
                                query: `delete event`,
                                params: [],
                            },
                        ],
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'rollback query',
                    params: [
                        'hi',
                        [
                            {
                                query: 'string',
                                params: ['hi'],
                            },
                            {
                                query: 'number',
                                params: [12],
                            },
                            {
                                query: 'object',
                                params: [{ hi: 12 }],
                            },
                        ],
                    ],
                },
            });

            when(context.connectionMock.doBatchAsync(deepEqual(finalqueries))).thenResolve();

            await context.evmAntennaMergerScheduler.evmEventMergerPoller();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).times(1);
            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).times(1);
            verify(context.newGroupEventControllerMock.convert(anything(), anyFunction())).times(2);
            verify(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).times(2);
            verify(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: anyNumber(),
                    }),
                ),
            ).times(2);
            verify(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: anyNumber(),
                        rollback_queries: [
                            {
                                query: `delete event`,
                                params: [],
                            },
                        ],
                    }),
                ),
            ).times(2);
            verify(context.connectionMock.doBatchAsync(deepEqual(finalqueries))).times(1);
        });

        it('should properly merge 10 events', async function() {
            const globalConfigEntity: GlobalEntity = {
                id: 'global',
                block_number: 21,
                processed_block_number: 10,
                eth_eur_price: 10000,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };
            const evmEventSetsQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                range: {
                                    block_number: {
                                        gte: 11,
                                        lte: 20,
                                    },
                                },
                            },
                        },
                    },
                },
            };
            const evmEventSetsResponse: ESSearchReturn<EVMEventSetEntity> = {
                took: 12,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    max_score: 1,
                    total: 2,
                    hits: [...Array(10).keys()].map(
                        (idx: number): ESSearchHit<EVMEventSetEntity> => ({
                            _index: 'idx',
                            _id: 'id',
                            _type: 'type',
                            _score: 1,
                            _source: {
                                artifact_name: 'T721Controller_v0',
                                event_name: 'NewGroup',
                                block_number: 11 + idx,
                                events: [
                                    {
                                        return_values: JSON.stringify({}),
                                        raw_data: 'raw_data',
                                        block_number: 11 + idx,
                                        raw_topics: ['raw_topics'],
                                        event: 'NewGroup',
                                        signature: 'signature',
                                        log_index: 0,
                                        transaction_index: 0,
                                        transaction_hash: 'transaction_hash',
                                        block_hash: 'block_hash',
                                        address: 'address',
                                    },
                                ],
                                created_at: new Date(Date.now()),
                                updated_at: new Date(Date.now()),
                            },
                        }),
                    ),
                },
            };

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalConfigEntity],
            });

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).thenResolve({
                error: null,
                response: evmEventSetsResponse,
            });

            when(context.newGroupEventControllerMock.convert(anything(), anyFunction())).thenCall(
                async (event: EVMProcessableEvent, append: Appender): Promise<void> => {
                    append(
                        {
                            query: `create event`,
                            params: [],
                        },

                        {
                            query: `delete event`,
                            params: [],
                        },
                    );
                },
            );

            when(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'rm this event',
                    params: [],
                },
            });

            when(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'increase block number',
                    params: [],
                },
            });

            when(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: anyNumber(),
                        rollback_queries: [
                            {
                                query: `delete event`,
                                params: [],
                            },
                        ],
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'rollback query',
                    params: [
                        'hi',
                        [
                            {
                                query: 'string',
                                params: ['hi'],
                            },
                            {
                                query: 'number',
                                params: [12],
                            },
                            {
                                query: 'object',
                                params: [{ hi: 12 }],
                            },
                        ],
                    ],
                },
            });

            when(context.connectionMock.doBatchAsync(anything())).thenResolve();

            await context.evmAntennaMergerScheduler.evmEventMergerPoller();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).times(1);
            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).times(1);
            verify(context.newGroupEventControllerMock.convert(anything(), anyFunction())).times(10);
            verify(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).times(10);
            verify(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: anyNumber(),
                    }),
                ),
            ).times(10);
            verify(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: anyNumber(),
                        rollback_queries: [
                            {
                                query: `delete event`,
                                params: [],
                            },
                        ],
                    }),
                ),
            ).times(10);
            verify(context.connectionMock.doBatchAsync(anything())).times(1);
        });

        it('should return 0 when no sets to process', async function() {
            const globalConfigEntity: GlobalEntity = {
                id: 'global',
                block_number: 12,
                processed_block_number: 10,
                eth_eur_price: 10000,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };
            const evmEventSetsQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                range: {
                                    block_number: {
                                        gte: 11,
                                        lte: 12,
                                    },
                                },
                            },
                        },
                    },
                },
            };
            const evmEventSetsResponse: ESSearchReturn<EVMEventSetEntity> = {
                took: 12,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    max_score: 1,
                    total: 0,
                    hits: [],
                },
            };

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalConfigEntity],
            });

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).thenResolve({
                error: null,
                response: evmEventSetsResponse,
            });

            await context.evmAntennaMergerScheduler.evmEventMergerPoller();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).times(1);
            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).times(1);
            verify(context.connectionMock.doBatchAsync(anything())).never();
        });

        it('should skip steps when no events', async function() {
            const globalConfigEntity: GlobalEntity = {
                id: 'global',
                block_number: 12,
                processed_block_number: 10,
                eth_eur_price: 10000,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };
            const evmEventSetsQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                range: {
                                    block_number: {
                                        gte: 11,
                                        lte: 12,
                                    },
                                },
                            },
                        },
                    },
                },
            };
            const evmEventSetsResponse: ESSearchReturn<EVMEventSetEntity> = {
                took: 12,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    max_score: 1,
                    total: 2,
                    hits: [...Array(2).keys()].map(
                        (idx: number): ESSearchHit<EVMEventSetEntity> => ({
                            _index: 'idx',
                            _id: 'id',
                            _type: 'type',
                            _score: 1,
                            _source: {
                                artifact_name: 'T721Controller_v0',
                                event_name: 'NewGroup',
                                block_number: 11 + idx,
                                events: [],
                                created_at: new Date(Date.now()),
                                updated_at: new Date(Date.now()),
                            },
                        }),
                    ),
                },
            };
            const finalqueries = [
                { query: 'rm this event', params: [] },
                { query: 'increase block number', params: [] },
                { query: 'rm this event', params: [] },
                { query: 'increase block number', params: [] },
            ];

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalConfigEntity],
            });

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).thenResolve({
                error: null,
                response: evmEventSetsResponse,
            });

            when(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'rm this event',
                    params: [],
                },
            });

            when(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'increase block number',
                    params: [],
                },
            });

            when(context.connectionMock.doBatchAsync(deepEqual(finalqueries))).thenResolve();

            await context.evmAntennaMergerScheduler.evmEventMergerPoller();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).times(1);
            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).times(1);
            verify(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).times(2);
            verify(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: anyNumber(),
                    }),
                ),
            ).times(2);
            verify(context.connectionMock.doBatchAsync(deepEqual(finalqueries))).times(1);
        });

        it('should skip as synchronized', async function() {
            const globalConfigEntity: GlobalEntity = {
                id: 'global',
                block_number: 12,
                processed_block_number: 12,
                eth_eur_price: 10000,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalConfigEntity],
            });

            await context.evmAntennaMergerScheduler.evmEventMergerPoller();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).times(1);
        });

        it('should interrupt for missing event set', async function() {
            const globalConfigEntity: GlobalEntity = {
                id: 'global',
                block_number: 12,
                processed_block_number: 10,
                eth_eur_price: 10000,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };
            const evmEventSetsQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                range: {
                                    block_number: {
                                        gte: 11,
                                        lte: 12,
                                    },
                                },
                            },
                        },
                    },
                },
            };
            const evmEventSetsResponse: ESSearchReturn<EVMEventSetEntity> = {
                took: 12,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    max_score: 1,
                    total: 1,
                    hits: [...Array(1).keys()].map(
                        (idx: number): ESSearchHit<EVMEventSetEntity> => ({
                            _index: 'idx',
                            _id: 'id',
                            _type: 'type',
                            _score: 1,
                            _source: {
                                artifact_name: 'T721Controller_v0',
                                event_name: 'NewGroup',
                                block_number: 11 + idx,
                                events: [
                                    {
                                        return_values: JSON.stringify({}),
                                        raw_data: 'raw_data',
                                        block_number: 11 + idx,
                                        raw_topics: ['raw_topics'],
                                        event: 'NewGroup',
                                        signature: 'signature',
                                        log_index: 0,
                                        transaction_index: 0,
                                        transaction_hash: 'transaction_hash',
                                        block_hash: 'block_hash',
                                        address: 'address',
                                    },
                                ],
                                created_at: new Date(Date.now()),
                                updated_at: new Date(Date.now()),
                            },
                        }),
                    ),
                },
            };
            const finalqueries = [
                { query: 'create event', params: [] },
                { query: 'rm this event', params: [] },
                { query: 'increase block number', params: [] },
                {
                    query: 'rollback query',
                    params: [
                        'hi',
                        [
                            { query: 'string', params: ['hi'] },
                            { query: 'number', params: ['12'] },
                            { query: 'object', params: ['{"hi":12}'] },
                        ],
                    ],
                },
                { query: 'create event', params: [] },
                { query: 'rm this event', params: [] },
                { query: 'increase block number', params: [] },
                {
                    query: 'rollback query',
                    params: [
                        'hi',
                        [
                            { query: 'string', params: ['hi'] },
                            { query: 'number', params: ['12'] },
                            { query: 'object', params: ['{"hi":12}'] },
                        ],
                    ],
                },
            ];

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalConfigEntity],
            });

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).thenResolve({
                error: null,
                response: evmEventSetsResponse,
            });

            when(context.newGroupEventControllerMock.convert(anything(), anyFunction())).thenCall(
                async (event: EVMProcessableEvent, append: Appender): Promise<void> => {
                    append(
                        {
                            query: `create event`,
                            params: [],
                        },

                        {
                            query: `delete event`,
                            params: [],
                        },
                    );
                },
            );

            when(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'rm this event',
                    params: [],
                },
            });

            when(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'increase block number',
                    params: [],
                },
            });

            when(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: anyNumber(),
                        rollback_queries: [
                            {
                                query: `delete event`,
                                params: [],
                            },
                        ],
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'rollback query',
                    params: [
                        'hi',
                        [
                            {
                                query: 'string',
                                params: ['hi'],
                            },
                            {
                                query: 'number',
                                params: [12],
                            },
                            {
                                query: 'object',
                                params: [{ hi: 12 }],
                            },
                        ],
                    ],
                },
            });

            when(context.connectionMock.doBatchAsync(anything())).thenResolve();

            await context.evmAntennaMergerScheduler.evmEventMergerPoller();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).times(1);
            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).times(1);
            verify(context.newGroupEventControllerMock.convert(anything(), anyFunction())).times(1);
            verify(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).times(1);
            verify(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: anyNumber(),
                    }),
                ),
            ).times(1);
            verify(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: anyNumber(),
                        rollback_queries: [
                            {
                                query: `delete event`,
                                params: [],
                            },
                        ],
                    }),
                ),
            ).times(1);
            verify(context.connectionMock.doBatchAsync(anything())).times(1);
        });

        it('should fail on config fetch error', async function() {
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

            const error = new NestError(
                `EVMAntennaMergerScheduler::evmEventMergerPoller | Unable to recover global config: unexpected_error`,
            );

            await expect(context.evmAntennaMergerScheduler.evmEventMergerPoller()).rejects.toMatchObject(error);

            verify(context.shutdownServiceMock.shutdownWithError(deepEqual(error))).called();
            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).times(1);
        });

        it('should fail on empty config fetch error', async function() {
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

            const error = new NestError(
                `EVMAntennaMergerScheduler::evmEventMergerPoller | Unable to recover global config: no document found`,
            );

            await expect(context.evmAntennaMergerScheduler.evmEventMergerPoller()).rejects.toMatchObject(error);

            verify(context.shutdownServiceMock.shutdownWithError(deepEqual(error))).called();
            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).times(1);
        });

        it('should fail on event set merge error', async function() {
            const globalConfigEntity: GlobalEntity = {
                id: 'global',
                block_number: 12,
                processed_block_number: 10,
                eth_eur_price: 10000,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };
            const evmEventSetsQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                range: {
                                    block_number: {
                                        gte: 11,
                                        lte: 12,
                                    },
                                },
                            },
                        },
                    },
                },
            };

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalConfigEntity],
            });

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const error = new NestError(
                'EVMAntennaMergerScheduler::fetchEvmEventSets | Error while fetching events for blocks 11 => 12: unexpected_error',
            );

            await expect(context.evmAntennaMergerScheduler.evmEventMergerPoller()).rejects.toMatchObject(error);

            verify(context.shutdownServiceMock.shutdownWithError(deepEqual(error))).times(1);
            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).times(1);
            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).times(1);
        });

        it('should properly merge events from same block', async function() {
            const globalConfigEntity: GlobalEntity = {
                id: 'global',
                block_number: 12,
                processed_block_number: 10,
                eth_eur_price: 10000,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };
            const evmEventSetsQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                range: {
                                    block_number: {
                                        gte: 11,
                                        lte: 12,
                                    },
                                },
                            },
                        },
                    },
                },
            };
            const evmEventSetsResponse: ESSearchReturn<EVMEventSetEntity> = {
                took: 12,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    max_score: 1,
                    total: 1,
                    hits: [
                        {
                            _index: 'idx',
                            _id: 'id',
                            _type: 'type',
                            _score: 1,
                            _source: {
                                artifact_name: 'T721Controller_v0',
                                event_name: 'NewGroup',
                                block_number: 11,
                                events: [...Array(2).keys()].map(
                                    (idx: number): EVMEvent => ({
                                        return_values: JSON.stringify({}),
                                        raw_data: 'raw_data',
                                        block_number: 11,
                                        raw_topics: ['raw_topics'],
                                        event: 'NewGroup',
                                        signature: 'signature',
                                        log_index: 0,
                                        transaction_index: idx,
                                        transaction_hash: 'transaction_hash',
                                        block_hash: 'block_hash',
                                        address: 'address',
                                    }),
                                ),
                                created_at: new Date(Date.now()),
                                updated_at: new Date(Date.now()),
                            },
                        },
                    ],
                },
            };

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalConfigEntity],
            });

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).thenResolve({
                error: null,
                response: evmEventSetsResponse,
            });

            when(context.newGroupEventControllerMock.convert(anything(), anyFunction())).thenCall(
                async (event: EVMProcessableEvent, append: Appender): Promise<void> => {
                    append(
                        {
                            query: `create event`,
                            params: [],
                        },

                        {
                            query: `delete event`,
                            params: [],
                        },
                    );
                },
            );

            when(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'rm this event',
                    params: [],
                },
            });

            when(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'increase block number',
                    params: [],
                },
            });

            when(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: anyNumber(),
                        rollback_queries: [
                            {
                                query: `delete event`,
                                params: [],
                            },
                            {
                                query: `delete event`,
                                params: [],
                            },
                        ],
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'rollback query',
                    params: [
                        'hi',
                        [
                            {
                                query: 'string',
                                params: ['hi'],
                            },
                            {
                                query: 'number',
                                params: [12],
                            },
                            {
                                query: 'object',
                                params: [{ hi: 12 }],
                            },
                        ],
                    ],
                },
            });

            when(context.connectionMock.doBatchAsync(anything())).thenResolve();

            await context.evmAntennaMergerScheduler.evmEventMergerPoller();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).times(1);
            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).times(1);
            verify(context.newGroupEventControllerMock.convert(anything(), anyFunction())).times(2);
            verify(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).times(1);
            verify(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: anyNumber(),
                    }),
                ),
            ).times(1);
            verify(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: anyNumber(),
                        rollback_queries: [
                            {
                                query: `delete event`,
                                params: [],
                            },
                            {
                                query: `delete event`,
                                params: [],
                            },
                        ],
                    }),
                ),
            ).times(1);
            verify(context.connectionMock.doBatchAsync(anything())).times(1);
        });

        it('should properly merge events from same block and same tx', async function() {
            const globalConfigEntity: GlobalEntity = {
                id: 'global',
                block_number: 12,
                processed_block_number: 10,
                eth_eur_price: 10000,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };
            const evmEventSetsQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                range: {
                                    block_number: {
                                        gte: 11,
                                        lte: 12,
                                    },
                                },
                            },
                        },
                    },
                },
            };
            const evmEventSetsResponse: ESSearchReturn<EVMEventSetEntity> = {
                took: 12,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    max_score: 1,
                    total: 1,
                    hits: [
                        {
                            _index: 'idx',
                            _id: 'id',
                            _type: 'type',
                            _score: 1,
                            _source: {
                                artifact_name: 'T721Controller_v0',
                                event_name: 'NewGroup',
                                block_number: 11,
                                events: [...Array(2).keys()].map(
                                    (idx: number): EVMEvent => ({
                                        return_values: JSON.stringify({}),
                                        raw_data: 'raw_data',
                                        block_number: 11,
                                        raw_topics: ['raw_topics'],
                                        event: 'NewGroup',
                                        signature: 'signature',
                                        log_index: idx,
                                        transaction_index: 0,
                                        transaction_hash: 'transaction_hash',
                                        block_hash: 'block_hash',
                                        address: 'address',
                                    }),
                                ),
                                created_at: new Date(Date.now()),
                                updated_at: new Date(Date.now()),
                            },
                        },
                    ],
                },
            };

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalConfigEntity],
            });

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).thenResolve({
                error: null,
                response: evmEventSetsResponse,
            });

            when(context.newGroupEventControllerMock.convert(anything(), anyFunction())).thenCall(
                async (event: EVMProcessableEvent, append: Appender): Promise<void> => {
                    append(
                        {
                            query: `create event`,
                            params: [],
                        },

                        {
                            query: `delete event`,
                            params: [],
                        },
                    );
                },
            );

            when(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'rm this event',
                    params: [],
                },
            });

            when(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'increase block number',
                    params: [],
                },
            });

            when(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: anyNumber(),
                        rollback_queries: [
                            {
                                query: `delete event`,
                                params: [],
                            },
                            {
                                query: `delete event`,
                                params: [],
                            },
                        ],
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'rollback query',
                    params: [
                        'hi',
                        [
                            {
                                query: 'string',
                                params: ['hi'],
                            },
                            {
                                query: 'number',
                                params: [12],
                            },
                            {
                                query: 'object',
                                params: [{ hi: 12 }],
                            },
                        ],
                    ],
                },
            });

            when(context.connectionMock.doBatchAsync(anything())).thenResolve();

            await context.evmAntennaMergerScheduler.evmEventMergerPoller();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).times(1);
            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).times(1);
            verify(context.newGroupEventControllerMock.convert(anything(), anyFunction())).times(2);
            verify(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).times(1);
            verify(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: anyNumber(),
                    }),
                ),
            ).times(1);
            verify(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: anyNumber(),
                        rollback_queries: [
                            {
                                query: `delete event`,
                                params: [],
                            },
                            {
                                query: `delete event`,
                                params: [],
                            },
                        ],
                    }),
                ),
            ).times(1);
            verify(context.connectionMock.doBatchAsync(anything())).times(1);
        });

        it('should fail on no matching controller', async function() {
            reset(context.newGroupEventControllerMock);
            when(context.newGroupEventControllerMock.eventName).thenReturn('NewGroup');
            when(context.newGroupEventControllerMock.artifactName).thenReturn('T721Controller_v0');
            when(context.newGroupEventControllerMock.isHandler('NewGroup', 'T721Controller_v0')).thenReturn(false);

            const globalConfigEntity: GlobalEntity = {
                id: 'global',
                block_number: 12,
                processed_block_number: 10,
                eth_eur_price: 10000,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };
            const evmEventSetsQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                range: {
                                    block_number: {
                                        gte: 11,
                                        lte: 12,
                                    },
                                },
                            },
                        },
                    },
                },
            };
            const evmEventSetsResponse: ESSearchReturn<EVMEventSetEntity> = {
                took: 12,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    max_score: 1,
                    total: 2,
                    hits: [...Array(2).keys()].map(
                        (idx: number): ESSearchHit<EVMEventSetEntity> => ({
                            _index: 'idx',
                            _id: 'id',
                            _type: 'type',
                            _score: 1,
                            _source: {
                                artifact_name: 'T721Controller_v0',
                                event_name: 'NewGroup',
                                block_number: 11 + idx,
                                events: [
                                    {
                                        return_values: JSON.stringify({}),
                                        raw_data: 'raw_data',
                                        block_number: 11 + idx,
                                        raw_topics: ['raw_topics'],
                                        event: 'NewGroup',
                                        signature: 'signature',
                                        log_index: 0,
                                        transaction_index: 0,
                                        transaction_hash: 'transaction_hash',
                                        block_hash: 'block_hash',
                                        address: 'address',
                                    },
                                ],
                                created_at: new Date(Date.now()),
                                updated_at: new Date(Date.now()),
                            },
                        }),
                    ),
                },
            };

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalConfigEntity],
            });

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).thenResolve({
                error: null,
                response: evmEventSetsResponse,
            });

            const error = new NestError(
                'EVMAntennaMergerScheduler::convertEventsToQueries | event NewGroup from T721Controller_v0 has no matching controller',
            );

            await expect(context.evmAntennaMergerScheduler.evmEventMergerPoller()).rejects.toMatchObject(error);

            verify(context.shutdownServiceMock.shutdownWithError(deepEqual(error))).times(1);
            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).times(1);
            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).times(1);
        });

        it('should fail on delete query error', async function() {
            const globalConfigEntity: GlobalEntity = {
                id: 'global',
                block_number: 12,
                processed_block_number: 10,
                eth_eur_price: 10000,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };
            const evmEventSetsQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                range: {
                                    block_number: {
                                        gte: 11,
                                        lte: 12,
                                    },
                                },
                            },
                        },
                    },
                },
            };
            const evmEventSetsResponse: ESSearchReturn<EVMEventSetEntity> = {
                took: 12,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    max_score: 1,
                    total: 2,
                    hits: [...Array(2).keys()].map(
                        (idx: number): ESSearchHit<EVMEventSetEntity> => ({
                            _index: 'idx',
                            _id: 'id',
                            _type: 'type',
                            _score: 1,
                            _source: {
                                artifact_name: 'T721Controller_v0',
                                event_name: 'NewGroup',
                                block_number: 11 + idx,
                                events: [
                                    {
                                        return_values: JSON.stringify({}),
                                        raw_data: 'raw_data',
                                        block_number: 11 + idx,
                                        raw_topics: ['raw_topics'],
                                        event: 'NewGroup',
                                        signature: 'signature',
                                        log_index: 0,
                                        transaction_index: 0,
                                        transaction_hash: 'transaction_hash',
                                        block_hash: 'block_hash',
                                        address: 'address',
                                    },
                                ],
                                created_at: new Date(Date.now()),
                                updated_at: new Date(Date.now()),
                            },
                        }),
                    ),
                },
            };
            const finalqueries = [
                { query: 'create event', params: [] },
                { query: 'rm this event', params: [] },
                { query: 'increase block number', params: [] },
                {
                    query: 'rollback query',
                    params: [
                        'hi',
                        [
                            { query: 'string', params: ['hi'] },
                            { query: 'number', params: ['12'] },
                            { query: 'object', params: ['{"hi":12}'] },
                        ],
                    ],
                },
                { query: 'create event', params: [] },
                { query: 'rm this event', params: [] },
                { query: 'increase block number', params: [] },
                {
                    query: 'rollback query',
                    params: [
                        'hi',
                        [
                            { query: 'string', params: ['hi'] },
                            { query: 'number', params: ['12'] },
                            { query: 'object', params: ['{"hi":12}'] },
                        ],
                    ],
                },
            ];

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalConfigEntity],
            });

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).thenResolve({
                error: null,
                response: evmEventSetsResponse,
            });

            when(context.newGroupEventControllerMock.convert(anything(), anyFunction())).thenCall(
                async (event: EVMProcessableEvent, append: Appender): Promise<void> => {
                    append(
                        {
                            query: `create event`,
                            params: [],
                        },

                        {
                            query: `delete event`,
                            params: [],
                        },
                    );
                },
            );

            when(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const error = new NestError(
                'EVMAntennaMergerScheduler::injectEventSetDeletionQueries | error while creating evmeventset removal on event NewGroup on controller T721Controller_v0',
            );

            await expect(context.evmAntennaMergerScheduler.evmEventMergerPoller()).rejects.toMatchObject(error);

            verify(context.shutdownServiceMock.shutdownWithError(deepEqual(error))).times(1);
            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).times(1);
            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).times(1);
            verify(context.newGroupEventControllerMock.convert(anything(), anyFunction())).times(1);
            verify(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).times(1);
        });

        it('should fail on processed height update error', async function() {
            const globalConfigEntity: GlobalEntity = {
                id: 'global',
                block_number: 12,
                processed_block_number: 10,
                eth_eur_price: 10000,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };
            const evmEventSetsQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                range: {
                                    block_number: {
                                        gte: 11,
                                        lte: 12,
                                    },
                                },
                            },
                        },
                    },
                },
            };
            const evmEventSetsResponse: ESSearchReturn<EVMEventSetEntity> = {
                took: 12,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    max_score: 1,
                    total: 2,
                    hits: [...Array(2).keys()].map(
                        (idx: number): ESSearchHit<EVMEventSetEntity> => ({
                            _index: 'idx',
                            _id: 'id',
                            _type: 'type',
                            _score: 1,
                            _source: {
                                artifact_name: 'T721Controller_v0',
                                event_name: 'NewGroup',
                                block_number: 11 + idx,
                                events: [
                                    {
                                        return_values: JSON.stringify({}),
                                        raw_data: 'raw_data',
                                        block_number: 11 + idx,
                                        raw_topics: ['raw_topics'],
                                        event: 'NewGroup',
                                        signature: 'signature',
                                        log_index: 0,
                                        transaction_index: 0,
                                        transaction_hash: 'transaction_hash',
                                        block_hash: 'block_hash',
                                        address: 'address',
                                    },
                                ],
                                created_at: new Date(Date.now()),
                                updated_at: new Date(Date.now()),
                            },
                        }),
                    ),
                },
            };
            const finalqueries = [
                { query: 'create event', params: [] },
                { query: 'rm this event', params: [] },
                { query: 'increase block number', params: [] },
                {
                    query: 'rollback query',
                    params: [
                        'hi',
                        [
                            { query: 'string', params: ['hi'] },
                            { query: 'number', params: ['12'] },
                            { query: 'object', params: ['{"hi":12}'] },
                        ],
                    ],
                },
                { query: 'create event', params: [] },
                { query: 'rm this event', params: [] },
                { query: 'increase block number', params: [] },
                {
                    query: 'rollback query',
                    params: [
                        'hi',
                        [
                            { query: 'string', params: ['hi'] },
                            { query: 'number', params: ['12'] },
                            { query: 'object', params: ['{"hi":12}'] },
                        ],
                    ],
                },
            ];

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalConfigEntity],
            });

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).thenResolve({
                error: null,
                response: evmEventSetsResponse,
            });

            when(context.newGroupEventControllerMock.convert(anything(), anyFunction())).thenCall(
                async (event: EVMProcessableEvent, append: Appender): Promise<void> => {
                    append(
                        {
                            query: `create event`,
                            params: [],
                        },

                        {
                            query: `delete event`,
                            params: [],
                        },
                    );
                },
            );

            when(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'rm this event',
                    params: [],
                },
            });

            when(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const error = new NestError(
                'EVMAntennaMergerScheduler::evmEventMerger | error while creating global config update query: unexpected_error',
            );

            await expect(context.evmAntennaMergerScheduler.evmEventMergerPoller()).rejects.toMatchObject(error);

            verify(context.shutdownServiceMock.shutdownWithError(deepEqual(error))).times(1);

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).times(1);
            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).times(1);
            verify(context.newGroupEventControllerMock.convert(anything(), anyFunction())).times(1);
            verify(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).times(1);
            verify(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: anyNumber(),
                    }),
                ),
            ).times(1);
        });

        it('should fail on rollback query creation errors', async function() {
            const globalConfigEntity: GlobalEntity = {
                id: 'global',
                block_number: 12,
                processed_block_number: 10,
                eth_eur_price: 10000,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };
            const evmEventSetsQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                range: {
                                    block_number: {
                                        gte: 11,
                                        lte: 12,
                                    },
                                },
                            },
                        },
                    },
                },
            };
            const evmEventSetsResponse: ESSearchReturn<EVMEventSetEntity> = {
                took: 12,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    max_score: 1,
                    total: 2,
                    hits: [...Array(2).keys()].map(
                        (idx: number): ESSearchHit<EVMEventSetEntity> => ({
                            _index: 'idx',
                            _id: 'id',
                            _type: 'type',
                            _score: 1,
                            _source: {
                                artifact_name: 'T721Controller_v0',
                                event_name: 'NewGroup',
                                block_number: 11 + idx,
                                events: [
                                    {
                                        return_values: JSON.stringify({}),
                                        raw_data: 'raw_data',
                                        block_number: 11 + idx,
                                        raw_topics: ['raw_topics'],
                                        event: 'NewGroup',
                                        signature: 'signature',
                                        log_index: 0,
                                        transaction_index: 0,
                                        transaction_hash: 'transaction_hash',
                                        block_hash: 'block_hash',
                                        address: 'address',
                                    },
                                ],
                                created_at: new Date(Date.now()),
                                updated_at: new Date(Date.now()),
                            },
                        }),
                    ),
                },
            };
            const finalqueries = [
                { query: 'create event', params: [] },
                { query: 'rm this event', params: [] },
                { query: 'increase block number', params: [] },
                {
                    query: 'rollback query',
                    params: [
                        'hi',
                        [
                            { query: 'string', params: ['hi'] },
                            { query: 'number', params: ['12'] },
                            { query: 'object', params: ['{"hi":12}'] },
                        ],
                    ],
                },
                { query: 'create event', params: [] },
                { query: 'rm this event', params: [] },
                { query: 'increase block number', params: [] },
                {
                    query: 'rollback query',
                    params: [
                        'hi',
                        [
                            { query: 'string', params: ['hi'] },
                            { query: 'number', params: ['12'] },
                            { query: 'object', params: ['{"hi":12}'] },
                        ],
                    ],
                },
            ];

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalConfigEntity],
            });

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).thenResolve({
                error: null,
                response: evmEventSetsResponse,
            });

            when(context.newGroupEventControllerMock.convert(anything(), anyFunction())).thenCall(
                async (event: EVMProcessableEvent, append: Appender): Promise<void> => {
                    append(
                        {
                            query: `create event`,
                            params: [],
                        },

                        {
                            query: `delete event`,
                            params: [],
                        },
                    );
                },
            );

            when(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'rm this event',
                    params: [],
                },
            });

            when(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'increase block number',
                    params: [],
                },
            });

            when(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: anyNumber(),
                        rollback_queries: [
                            {
                                query: `delete event`,
                                params: [],
                            },
                        ],
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const error = new NestError(
                'EVMAntennaMergerScheduler::injectBlockRollbackCreationQuery | error while creating block rollback query: unexpected_error',
            );

            await expect(context.evmAntennaMergerScheduler.evmEventMergerPoller()).rejects.toMatchObject(error);

            verify(context.shutdownServiceMock.shutdownWithError(deepEqual(error))).times(1);
            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).times(1);
            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).times(1);
            verify(context.newGroupEventControllerMock.convert(anything(), anyFunction())).times(1);
            verify(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).times(1);
            verify(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: anyNumber(),
                    }),
                ),
            ).times(1);
            verify(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: anyNumber(),
                        rollback_queries: [
                            {
                                query: `delete event`,
                                params: [],
                            },
                        ],
                    }),
                ),
            ).times(1);
        });

        it('should fail on batch error', async function() {
            const globalConfigEntity: GlobalEntity = {
                id: 'global',
                block_number: 12,
                processed_block_number: 10,
                eth_eur_price: 10000,
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };
            const evmEventSetsQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                range: {
                                    block_number: {
                                        gte: 11,
                                        lte: 12,
                                    },
                                },
                            },
                        },
                    },
                },
            };
            const evmEventSetsResponse: ESSearchReturn<EVMEventSetEntity> = {
                took: 12,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    max_score: 1,
                    total: 2,
                    hits: [...Array(2).keys()].map(
                        (idx: number): ESSearchHit<EVMEventSetEntity> => ({
                            _index: 'idx',
                            _id: 'id',
                            _type: 'type',
                            _score: 1,
                            _source: {
                                artifact_name: 'T721Controller_v0',
                                event_name: 'NewGroup',
                                block_number: 11 + idx,
                                events: [
                                    {
                                        return_values: JSON.stringify({}),
                                        raw_data: 'raw_data',
                                        block_number: 11 + idx,
                                        raw_topics: ['raw_topics'],
                                        event: 'NewGroup',
                                        signature: 'signature',
                                        log_index: 0,
                                        transaction_index: 0,
                                        transaction_hash: 'transaction_hash',
                                        block_hash: 'block_hash',
                                        address: 'address',
                                    },
                                ],
                                created_at: new Date(Date.now()),
                                updated_at: new Date(Date.now()),
                            },
                        }),
                    ),
                },
            };
            const finalqueries = [
                { query: 'create event', params: [] },
                { query: 'rm this event', params: [] },
                { query: 'increase block number', params: [] },
                {
                    query: 'rollback query',
                    params: [
                        'hi',
                        [
                            { query: 'string', params: ['hi'] },
                            { query: 'number', params: ['12'] },
                            { query: 'object', params: ['{"hi":12}'] },
                        ],
                    ],
                },
                { query: 'create event', params: [] },
                { query: 'rm this event', params: [] },
                { query: 'increase block number', params: [] },
                {
                    query: 'rollback query',
                    params: [
                        'hi',
                        [
                            { query: 'string', params: ['hi'] },
                            { query: 'number', params: ['12'] },
                            { query: 'object', params: ['{"hi":12}'] },
                        ],
                    ],
                },
            ];

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalConfigEntity],
            });

            when(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).thenResolve({
                error: null,
                response: evmEventSetsResponse,
            });

            when(context.newGroupEventControllerMock.convert(anything(), anyFunction())).thenCall(
                async (event: EVMProcessableEvent, append: Appender): Promise<void> => {
                    append(
                        {
                            query: `create event`,
                            params: [],
                        },

                        {
                            query: `delete event`,
                            params: [],
                        },
                    );
                },
            );

            when(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'rm this event',
                    params: [],
                },
            });

            when(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: anyNumber(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'increase block number',
                    params: [],
                },
            });

            when(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: anyNumber(),
                        rollback_queries: [
                            {
                                query: `delete event`,
                                params: [],
                            },
                        ],
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'rollback query',
                    params: [
                        'hi',
                        [
                            {
                                query: 'string',
                                params: ['hi'],
                            },
                            {
                                query: 'number',
                                params: [12],
                            },
                            {
                                query: 'object',
                                params: [{ hi: 12 }],
                            },
                        ],
                    ],
                },
            });

            const error = new Error('unexpected error');

            when(context.connectionMock.doBatchAsync(deepEqual(finalqueries))).thenReject(error);

            await expect(context.evmAntennaMergerScheduler.evmEventMergerPoller()).rejects.toMatchObject(error);

            verify(context.shutdownServiceMock.shutdownWithError(deepEqual(error))).times(1);
            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).times(1);
            verify(context.evmEventSetsServiceMock.searchElastic(deepEqual(evmEventSetsQuery))).times(1);
            verify(context.newGroupEventControllerMock.convert(anything(), anyFunction())).times(2);
            verify(
                context.evmEventSetsServiceMock.dryDelete(
                    deepEqual({
                        artifact_name: 'T721Controller_v0',
                        event_name: 'NewGroup',
                        block_number: anyNumber(),
                    }),
                ),
            ).times(2);
            verify(
                context.globalConfigServiceMock.dryUpdate(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        processed_block_number: anyNumber(),
                    }),
                ),
            ).times(2);
            verify(
                context.evmBlockRollbacksServiceMock.dryCreate(
                    deepEqual({
                        block_number: anyNumber(),
                        rollback_queries: [
                            {
                                query: `delete event`,
                                params: [],
                            },
                        ],
                    }),
                ),
            ).times(2);
            verify(context.connectionMock.doBatchAsync(deepEqual(finalqueries))).times(1);
        });
    });

    describe('onApplicationBootstrap', function() {
        it('should subscribe to all as worker master', async function() {
            const signature: InstanceSignature = {
                name: 'worker',
                master: true,
            } as InstanceSignature;

            when(context.outrospectionServiceMock.getInstanceSignature()).thenResolve(signature);

            await context.evmAntennaMergerScheduler.onApplicationBootstrap();

            verify(context.scheduleMock.scheduleIntervalJob('evmEventMerger', 500, anyFunction())).called();
        });

        it('should subscribe to bull only as worker non master', async function() {
            const signature: InstanceSignature = {
                name: 'worker',
                master: false,
            } as InstanceSignature;

            when(context.outrospectionServiceMock.getInstanceSignature()).thenResolve(signature);

            await context.evmAntennaMergerScheduler.onApplicationBootstrap();

            verify(context.scheduleMock.scheduleIntervalJob('evmEventMerger', 500, anyFunction())).never();
        });

        it('should subscribe to none as server non master', async function() {
            const signature: InstanceSignature = {
                name: 'server',
                master: false,
            } as InstanceSignature;

            when(context.outrospectionServiceMock.getInstanceSignature()).thenResolve(signature);

            await context.evmAntennaMergerScheduler.onApplicationBootstrap();

            verify(context.scheduleMock.scheduleIntervalJob('evmEventMerger', 500, anyFunction())).never();
        });
    });
});
