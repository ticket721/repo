import {
    EVMEventControllerBase,
    EVMEventFetcherJob,
    EVMEventRawResult,
} from '@app/worker/evmantenna/EVMEvent.controller.base';
import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';
import { Schedule } from 'nest-schedule';
import { Job, Queue } from 'bull';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import {
    InstanceSignature,
    OutrospectionService,
} from '@lib/common/outrospection/Outrospection.service';
import { EVMEventSetsService } from '@lib/common/evmeventsets/EVMEventSets.service';
import {
    anything,
    deepEqual,
    instance,
    mock,
    spy,
    verify,
    when,
} from 'ts-mockito';
import { GlobalEntity } from '@lib/common/globalconfig/entities/Global.entity';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra';
import { ESSearchReturn } from '@lib/common/utils/ESSearchReturn';
import {
    EVMEvent,
    EVMEventSetEntity,
} from '@lib/common/evmeventsets/entities/EVMEventSet.entity';

describe('EVMEvent Controller Base', function() {
    const context: {
        evmEventControllerBase: EVMEventControllerBase;
        contractsControllerMock: ContractsControllerBase;
        scheduleMock: Schedule;
        queueMock: Queue<EVMEventFetcherJob>;
        globalConfigServiceMock: GlobalConfigService;
        shutdownServiceMock: ShutdownService;
        outrospectionServiceMock: OutrospectionService;
        evmEventSetsServiceMock: EVMEventSetsService;
    } = {
        evmEventControllerBase: null,
        contractsControllerMock: null,
        scheduleMock: null,
        queueMock: null,
        globalConfigServiceMock: null,
        shutdownServiceMock: null,
        outrospectionServiceMock: null,
        evmEventSetsServiceMock: null,
    };

    beforeEach(async function() {
        context.contractsControllerMock = mock(ContractsControllerBase);
        context.scheduleMock = mock(Schedule);
        context.queueMock = mock<Queue<EVMEventFetcherJob>>();
        context.globalConfigServiceMock = mock(GlobalConfigService);
        context.shutdownServiceMock = mock(ShutdownService);
        context.outrospectionServiceMock = mock(OutrospectionService);
        context.evmEventSetsServiceMock = mock(EVMEventSetsService);

        const artifactName = 't721c::T721Controller_v0';

        when(context.contractsControllerMock.getArtifactName()).thenReturn(
            artifactName,
        );

        context.evmEventControllerBase = new EVMEventControllerBase(
            instance(context.contractsControllerMock),
            instance(context.scheduleMock),
            instance(context.queueMock),
            instance(context.globalConfigServiceMock),
            instance(context.shutdownServiceMock),
            instance(context.outrospectionServiceMock),
            instance(context.evmEventSetsServiceMock),
            'NewGroup',
        );
    });

    describe('artifactName', function() {
        it('should recover artifact name', async function() {
            const artifactName = 't721c::T721Controller_v0';

            when(context.contractsControllerMock.getArtifactName()).thenReturn(
                artifactName,
            );
            const res = context.evmEventControllerBase.artifactName;

            expect(res).toEqual(artifactName);

            verify(context.contractsControllerMock.getArtifactName()).called();
        });
    });

    describe('convert', function() {
        it('throw, shutdown and warn about unoverriden method', async function() {
            const artifactName = 't721c::T721Controller_v0';
            const errorMsg = `Error in ${artifactName}/NewGroup | convert should be overriden`;

            when(context.contractsControllerMock.getArtifactName()).thenReturn(
                artifactName,
            );

            await expect(
                context.evmEventControllerBase.convert(null, null),
            ).rejects.toMatchObject(new Error(errorMsg));

            verify(context.contractsControllerMock.getArtifactName()).called();
            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new Error(errorMsg)),
                ),
            ).called();
        });
    });

    describe('fetch', function() {
        it('should fetch events', async function() {
            const artifactName = 't721c::T721Controller_v0';

            const instance = {
                getPastEvents: async (): Promise<EVMEventRawResult[]> => [],
            };

            when(context.contractsControllerMock.getArtifactName()).thenReturn(
                artifactName,
            );
            when(context.contractsControllerMock.get()).thenResolve(instance);

            const res = await context.evmEventControllerBase.fetch(0, 0);
            expect(res).toEqual([]);

            verify(context.contractsControllerMock.getArtifactName()).called();
        });
    });

    describe('isHandler', function() {
        it('should return true', async function() {
            const artifactName = 't721c::T721Controller_v0';

            when(context.contractsControllerMock.getArtifactName()).thenReturn(
                artifactName,
            );

            const res = await context.evmEventControllerBase.isHandler(
                'NewGroup',
                artifactName,
            );
            expect(res).toEqual(true);

            verify(context.contractsControllerMock.getArtifactName()).called();
        });

        it('should return false for invalid event name', async function() {
            const artifactName = 't721c::T721Controller_v0';

            when(context.contractsControllerMock.getArtifactName()).thenReturn(
                artifactName,
            );

            const res = await context.evmEventControllerBase.isHandler(
                'NewCategory',
                artifactName,
            );
            expect(res).toEqual(false);

            verify(context.contractsControllerMock.getArtifactName()).called();
        });

        it('should return false for invalid artifact name', async function() {
            const artifactName = 't721c::T721Controller_v0';

            when(context.contractsControllerMock.getArtifactName()).thenReturn(
                artifactName,
            );

            const res = await context.evmEventControllerBase.isHandler(
                'NewGroup',
                'invalid',
            );
            expect(res).toEqual(false);

            verify(context.contractsControllerMock.getArtifactName()).called();
        });
    });

    describe('eventBackgroundFetcher', function() {
        it('should dispatch one fetch request', async function() {
            const globalEntity: Partial<GlobalEntity> = {
                block_number: 100,
                processed_block_number: 99,
            };
            const artifactName = 't721c::T721Controller_v0';

            const fetchJobName = `@@evmantenna/fetchEVMEventsForBlock/${artifactName}/NewGroup`;

            const esquery: EsSearchOptionsStatic = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        block_number: 100,
                                    },
                                },
                                {
                                    term: {
                                        event_name: 'NewGroup',
                                    },
                                },
                                {
                                    term: {
                                        artifact_name: artifactName,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esReturn: ESSearchReturn<any> = {
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
                            _source: {} as any,
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
                response: [globalEntity as GlobalEntity],
            });

            when(
                context.queueMock.getJobs(deepEqual(['active', 'waiting'])),
            ).thenResolve([]);

            when(context.contractsControllerMock.getArtifactName()).thenReturn(
                artifactName,
            );

            when(
                context.evmEventSetsServiceMock.searchElastic(
                    deepEqual(esquery),
                ),
            ).thenResolve({
                error: null,
                response: esReturn,
            });

            await context.evmEventControllerBase.eventBackgroundFetcher();

            verify(
                context.queueMock.getJobs(deepEqual(['active', 'waiting'])),
            ).called();

            verify(
                context.queueMock.add(
                    fetchJobName,
                    deepEqual({
                        blockNumber: 100,
                    }),
                ),
            ).called();

            verify(context.contractsControllerMock.getArtifactName()).called();

            verify(
                context.evmEventSetsServiceMock.searchElastic(
                    deepEqual(esquery),
                ),
            ).called();
        });

        it('should dispatch no new fetch', async function() {
            const globalEntity: Partial<GlobalEntity> = {
                block_number: 100,
                processed_block_number: 100,
            };
            const artifactName = 't721c::T721Controller_v0';

            const fetchJobName = `@@evmantenna/fetchEVMEventsForBlock/${artifactName}/NewGroup`;

            const esquery: EsSearchOptionsStatic = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        block_number: 100,
                                    },
                                },
                                {
                                    term: {
                                        event_name: 'NewGroup',
                                    },
                                },
                                {
                                    term: {
                                        artifact_name: artifactName,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esReturn: ESSearchReturn<any> = {
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
                            _source: {} as any,
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
                response: [globalEntity as GlobalEntity],
            });

            when(
                context.queueMock.getJobs(deepEqual(['active', 'waiting'])),
            ).thenResolve([]);

            when(context.contractsControllerMock.getArtifactName()).thenReturn(
                artifactName,
            );

            await context.evmEventControllerBase.eventBackgroundFetcher();

            verify(
                context.queueMock.getJobs(deepEqual(['active', 'waiting'])),
            ).called();

            verify(context.contractsControllerMock.getArtifactName()).called();
        });

        it('should dispatch one fetch request with internal value already set', async function() {
            const globalEntity: Partial<GlobalEntity> = {
                block_number: 100,
                processed_block_number: 99,
            };
            const artifactName = 't721c::T721Controller_v0';

            const fetchJobName = `@@evmantenna/fetchEVMEventsForBlock/${artifactName}/NewGroup`;

            const esquery: EsSearchOptionsStatic = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        block_number: 100,
                                    },
                                },
                                {
                                    term: {
                                        event_name: 'NewGroup',
                                    },
                                },
                                {
                                    term: {
                                        artifact_name: artifactName,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esReturn: ESSearchReturn<any> = {
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
                            _source: {} as any,
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
                response: [globalEntity as GlobalEntity],
            });

            when(
                context.queueMock.getJobs(deepEqual(['active', 'waiting'])),
            ).thenResolve([]);

            when(context.contractsControllerMock.getArtifactName()).thenReturn(
                artifactName,
            );

            when(
                context.evmEventSetsServiceMock.searchElastic(
                    deepEqual(esquery),
                ),
            ).thenResolve({
                error: null,
                response: esReturn,
            });

            (context.evmEventControllerBase as any).currentFetchHeight = 99;
            (context.evmEventControllerBase as any).currentDispatchHeight = 99;

            await context.evmEventControllerBase.eventBackgroundFetcher();

            verify(
                context.queueMock.getJobs(deepEqual(['active', 'waiting'])),
            ).called();

            verify(
                context.queueMock.add(
                    fetchJobName,
                    deepEqual({
                        blockNumber: 100,
                    }),
                ),
            ).called();

            verify(context.contractsControllerMock.getArtifactName()).called();

            verify(
                context.evmEventSetsServiceMock.searchElastic(
                    deepEqual(esquery),
                ),
            ).called();
        });

        it('should dispatch nothing if globalconfig block_number not set', async function() {
            const globalEntity: Partial<GlobalEntity> = {
                block_number: 0,
                processed_block_number: 0,
            };
            const artifactName = 't721c::T721Controller_v0';

            const fetchJobName = `@@evmantenna/fetchEVMEventsForBlock/${artifactName}/NewGroup`;

            const esquery: EsSearchOptionsStatic = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        block_number: 100,
                                    },
                                },
                                {
                                    term: {
                                        event_name: 'NewGroup',
                                    },
                                },
                                {
                                    term: {
                                        artifact_name: artifactName,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esReturn: ESSearchReturn<any> = {
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
                            _source: {} as any,
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
                response: [globalEntity as GlobalEntity],
            });

            await context.evmEventControllerBase.eventBackgroundFetcher();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();
        });

        it('should dispatch nothing if globalconfig processed_block_number not set', async function() {
            const globalEntity: Partial<GlobalEntity> = {
                block_number: 100,
                processed_block_number: 0,
            };
            const artifactName = 't721c::T721Controller_v0';

            const fetchJobName = `@@evmantenna/fetchEVMEventsForBlock/${artifactName}/NewGroup`;

            const esquery: EsSearchOptionsStatic = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        block_number: 100,
                                    },
                                },
                                {
                                    term: {
                                        event_name: 'NewGroup',
                                    },
                                },
                                {
                                    term: {
                                        artifact_name: artifactName,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esReturn: ESSearchReturn<any> = {
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
                            _source: {} as any,
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
                response: [globalEntity as GlobalEntity],
            });

            await context.evmEventControllerBase.eventBackgroundFetcher();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();
        });

        it('should fail on global config error', async function() {
            const globalEntity: Partial<GlobalEntity> = {
                block_number: 100,
                processed_block_number: 99,
            };
            const artifactName = 't721c::T721Controller_v0';

            const fetchJobName = `@@evmantenna/fetchEVMEventsForBlock/${artifactName}/NewGroup`;

            const esquery: EsSearchOptionsStatic = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        block_number: 100,
                                    },
                                },
                                {
                                    term: {
                                        event_name: 'NewGroup',
                                    },
                                },
                                {
                                    term: {
                                        artifact_name: artifactName,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esReturn: ESSearchReturn<any> = {
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
                            _source: {} as any,
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
                error: 'unexpected_error',
                response: null,
            });

            await context.evmEventControllerBase.eventBackgroundFetcher();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(
                        new Error(
                            `Unable to recover global config: unexpected_error`,
                        ),
                    ),
                ),
            );
        });

        it('should fail on global config empty fetch', async function() {
            const globalEntity: Partial<GlobalEntity> = {
                block_number: 100,
                processed_block_number: 99,
            };
            const artifactName = 't721c::T721Controller_v0';

            const fetchJobName = `@@evmantenna/fetchEVMEventsForBlock/${artifactName}/NewGroup`;

            const esquery: EsSearchOptionsStatic = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        block_number: 100,
                                    },
                                },
                                {
                                    term: {
                                        event_name: 'NewGroup',
                                    },
                                },
                                {
                                    term: {
                                        artifact_name: artifactName,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esReturn: ESSearchReturn<any> = {
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
                            _source: {} as any,
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
                response: [],
            });

            await context.evmEventControllerBase.eventBackgroundFetcher();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(
                        new Error(
                            `Unable to recover global config: no global config`,
                        ),
                    ),
                ),
            );
        });

        it('should dispatch one fetch request', async function() {
            const globalEntity: Partial<GlobalEntity> = {
                block_number: 100,
                processed_block_number: 99,
            };
            const artifactName = 't721c::T721Controller_v0';

            const fetchJobName = `@@evmantenna/fetchEVMEventsForBlock/${artifactName}/NewGroup`;

            const esquery: EsSearchOptionsStatic = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        block_number: 100,
                                    },
                                },
                                {
                                    term: {
                                        event_name: 'NewGroup',
                                    },
                                },
                                {
                                    term: {
                                        artifact_name: artifactName,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esReturn: ESSearchReturn<any> = {
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
                            _source: {} as any,
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
                response: [globalEntity as GlobalEntity],
            });

            when(
                context.queueMock.getJobs(deepEqual(['active', 'waiting'])),
            ).thenResolve([]);

            when(context.contractsControllerMock.getArtifactName()).thenReturn(
                artifactName,
            );

            when(
                context.evmEventSetsServiceMock.searchElastic(
                    deepEqual(esquery),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await context.evmEventControllerBase.eventBackgroundFetcher();

            verify(
                context.queueMock.getJobs(deepEqual(['active', 'waiting'])),
            ).called();

            verify(
                context.queueMock.add(
                    fetchJobName,
                    deepEqual({
                        blockNumber: 100,
                    }),
                ),
            ).called();

            verify(context.contractsControllerMock.getArtifactName()).called();

            verify(
                context.evmEventSetsServiceMock.searchElastic(
                    deepEqual(esquery),
                ),
            ).called();

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(
                        new Error(
                            `EVMEventControllerBase::eventsBackgroundFetcher | error while fetching EVMEvent Sets`,
                        ),
                    ),
                ),
            );
        });

        it('should not dispatch because job still running', async function() {
            const globalEntity: Partial<GlobalEntity> = {
                block_number: 100,
                processed_block_number: 99,
            };
            const artifactName = 't721c::T721Controller_v0';

            const fetchJobName = `@@evmantenna/fetchEVMEventsForBlock/${artifactName}/NewGroup`;

            const esquery: EsSearchOptionsStatic = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        block_number: 100,
                                    },
                                },
                                {
                                    term: {
                                        event_name: 'NewGroup',
                                    },
                                },
                                {
                                    term: {
                                        artifact_name: artifactName,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esReturn: ESSearchReturn<any> = {
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
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalEntity as GlobalEntity],
            });

            when(
                context.queueMock.getJobs(deepEqual(['active', 'waiting'])),
            ).thenResolve([
                {
                    name: fetchJobName,
                    data: {
                        blockNumber: 100,
                    },
                } as Job,
            ]);

            when(context.contractsControllerMock.getArtifactName()).thenReturn(
                artifactName,
            );

            when(
                context.evmEventSetsServiceMock.searchElastic(
                    deepEqual(esquery),
                ),
            ).thenResolve({
                error: null,
                response: esReturn,
            });

            when(
                context.queueMock.add(
                    fetchJobName,
                    deepEqual({
                        blockNumber: 100,
                    }),
                ),
            ).thenResolve();

            await context.evmEventControllerBase.eventBackgroundFetcher();

            verify(
                context.queueMock.getJobs(deepEqual(['active', 'waiting'])),
            ).called();

            verify(context.contractsControllerMock.getArtifactName()).called();

            verify(
                context.evmEventSetsServiceMock.searchElastic(
                    deepEqual(esquery),
                ),
            ).called();
        });

        it('should dispatch because job not running', async function() {
            const globalEntity: Partial<GlobalEntity> = {
                block_number: 100,
                processed_block_number: 99,
            };
            const artifactName = 't721c::T721Controller_v0';

            const fetchJobName = `@@evmantenna/fetchEVMEventsForBlock/${artifactName}/NewGroup`;

            const esquery: EsSearchOptionsStatic = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        block_number: 100,
                                    },
                                },
                                {
                                    term: {
                                        event_name: 'NewGroup',
                                    },
                                },
                                {
                                    term: {
                                        artifact_name: artifactName,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esReturn: ESSearchReturn<any> = {
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
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [globalEntity as GlobalEntity],
            });

            when(
                context.queueMock.getJobs(deepEqual(['active', 'waiting'])),
            ).thenResolve([]);

            when(context.contractsControllerMock.getArtifactName()).thenReturn(
                artifactName,
            );

            when(
                context.evmEventSetsServiceMock.searchElastic(
                    deepEqual(esquery),
                ),
            ).thenResolve({
                error: null,
                response: esReturn,
            });

            when(
                context.queueMock.add(
                    fetchJobName,
                    deepEqual({
                        blockNumber: 100,
                    }),
                ),
            ).thenResolve();

            await context.evmEventControllerBase.eventBackgroundFetcher();

            verify(
                context.queueMock.getJobs(deepEqual(['active', 'waiting'])),
            ).called();

            verify(
                context.queueMock.add(
                    fetchJobName,
                    deepEqual({
                        blockNumber: 100,
                    }),
                ),
            ).called();

            verify(context.contractsControllerMock.getArtifactName()).called();

            verify(
                context.evmEventSetsServiceMock.searchElastic(
                    deepEqual(esquery),
                ),
            ).called();
        });
    });

    describe('fetchEVMEventsForBlock', function() {
        it('should fetch events for a specific block', async function() {
            const job: Partial<Job> = {
                data: {
                    blockNumber: 99,
                },
                progress: async () => {},
            };

            const rawEvents = [
                {
                    logIndex: 0,
                    transactionIndex: 0,
                    transactionHash:
                        '0x54ac26f354aadb32efafb927b3cf5f7a9223006f076760d799321989cf2e28b6',
                    blockHash:
                        '0x8a05e695944e5566e8a54c8bc23d6e7edd4a326b2e791e90486b5ea2101145d1',
                    blockNumber: 34,
                    address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                    type: 'mined',
                    id: 'log_0f692965',
                    returnValues: {
                        '0':
                            '0x58d7c741e1121265d8f8cfbadad5bb4b1cfb8ed466f533005108cefdf8b89627',
                        '1': '0xc05187f1ec1a88bA07A880AcE290ebE1b0941D9F',
                        '2': '@event/modules',
                        id:
                            '0x58d7c741e1121265d8f8cfbadad5bb4b1cfb8ed466f533005108cefdf8b89627',
                        owner: '0xc05187f1ec1a88bA07A880AcE290ebE1b0941D9F',
                        controllers: '@event/modules',
                    },
                    event: 'NewGroup',
                    signature:
                        '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                    raw: {
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                        topics: [
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                            '0x58d7c741e1121265d8f8cfbadad5bb4b1cfb8ed466f533005108cefdf8b89627',
                            '0x000000000000000000000000c05187f1ec1a88ba07a880ace290ebe1b0941d9f',
                        ],
                    },
                },
            ];

            const eventSetEntity = {
                artifact_name: 't721controller::T721Controller_v0',
                event_name: 'NewGroup',
                block_number: 34,
                events: [
                    {
                        return_values:
                            '{"0":"0x58d7c741e1121265d8f8cfbadad5bb4b1cfb8ed466f533005108cefdf8b89627","1":"0xc05187f1ec1a88bA07A880AcE290ebE1b0941D9F","2":"@event/modules","id":"0x58d7c741e1121265d8f8cfbadad5bb4b1cfb8ed466f533005108cefdf8b89627","owner":"0xc05187f1ec1a88bA07A880AcE290ebE1b0941D9F","controllers":"@event/modules"}',
                        raw_data:
                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                        raw_topics: [
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                            '0x58d7c741e1121265d8f8cfbadad5bb4b1cfb8ed466f533005108cefdf8b89627',
                            '0x000000000000000000000000c05187f1ec1a88ba07a880ace290ebe1b0941d9f',
                        ],
                        event: 'NewGroup',
                        signature:
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                        log_index: 0,
                        transaction_index: 0,
                        transaction_hash:
                            '0x54ac26f354aadb32efafb927b3cf5f7a9223006f076760d799321989cf2e28b6',
                        block_hash:
                            '0x8a05e695944e5566e8a54c8bc23d6e7edd4a326b2e791e90486b5ea2101145d1',
                        block_number: 34,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                    },
                ],
            };

            const artifactName = 't721c::T721Controller_v0';

            const spied = spy(context.evmEventControllerBase);

            when(spied.fetch(99, 99)).thenResolve(rawEvents);

            when(context.contractsControllerMock.getArtifactName()).thenReturn(
                artifactName,
            );

            when(
                context.evmEventSetsServiceMock.create(
                    deepEqual({
                        artifact_name: artifactName,
                        event_name: 'NewGroup',
                        block_number: 99,
                        events: rawEvents.map(
                            (ev: EVMEventRawResult): EVMEvent => ({
                                return_values: JSON.stringify(ev.returnValues),
                                raw_data: ev.raw.data,
                                raw_topics: ev.raw.topics,
                                event: ev.event,
                                signature: ev.signature,
                                log_index: ev.logIndex,
                                transaction_index: ev.transactionIndex,
                                transaction_hash: ev.transactionHash,
                                block_hash: ev.blockHash,
                                block_number: ev.blockNumber,
                                address: ev.address,
                            }),
                        ),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: eventSetEntity as EVMEventSetEntity,
            });

            await context.evmEventControllerBase.fetchEVMEventsForBlock(
                job as Job,
            );

            verify(spied.fetch(99, 99)).called();

            verify(context.contractsControllerMock.getArtifactName()).called();

            verify(
                context.evmEventSetsServiceMock.create(
                    deepEqual({
                        artifact_name: artifactName,
                        event_name: 'NewGroup',
                        block_number: 99,
                        events: rawEvents.map(
                            (ev: EVMEventRawResult): EVMEvent => ({
                                return_values: JSON.stringify(ev.returnValues),
                                raw_data: ev.raw.data,
                                raw_topics: ev.raw.topics,
                                event: ev.event,
                                signature: ev.signature,
                                log_index: ev.logIndex,
                                transaction_index: ev.transactionIndex,
                                transaction_hash: ev.transactionHash,
                                block_hash: ev.blockHash,
                                block_number: ev.blockNumber,
                                address: ev.address,
                            }),
                        ),
                    }),
                ),
            ).called();
        });

        it('should fetch 0 events for a specific block', async function() {
            const job: Partial<Job> = {
                data: {
                    blockNumber: 99,
                },
                progress: async () => {},
            };

            const rawEvents = [];

            const eventSetEntity = {
                artifact_name: 't721controller::T721Controller_v0',
                event_name: 'NewGroup',
                block_number: 34,
                events: [],
            };

            const artifactName = 't721c::T721Controller_v0';

            const spied = spy(context.evmEventControllerBase);

            when(spied.fetch(99, 99)).thenResolve(rawEvents);

            when(context.contractsControllerMock.getArtifactName()).thenReturn(
                artifactName,
            );

            when(
                context.evmEventSetsServiceMock.create(
                    deepEqual({
                        artifact_name: artifactName,
                        event_name: 'NewGroup',
                        block_number: 99,
                        events: rawEvents.map(
                            (ev: EVMEventRawResult): EVMEvent => ({
                                return_values: JSON.stringify(ev.returnValues),
                                raw_data: ev.raw.data,
                                raw_topics: ev.raw.topics,
                                event: ev.event,
                                signature: ev.signature,
                                log_index: ev.logIndex,
                                transaction_index: ev.transactionIndex,
                                transaction_hash: ev.transactionHash,
                                block_hash: ev.blockHash,
                                block_number: ev.blockNumber,
                                address: ev.address,
                            }),
                        ),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: eventSetEntity as EVMEventSetEntity,
            });

            await context.evmEventControllerBase.fetchEVMEventsForBlock(
                job as Job,
            );

            verify(spied.fetch(99, 99)).called();

            verify(context.contractsControllerMock.getArtifactName()).called();

            verify(
                context.evmEventSetsServiceMock.create(
                    deepEqual({
                        artifact_name: artifactName,
                        event_name: 'NewGroup',
                        block_number: 99,
                        events: rawEvents.map(
                            (ev: EVMEventRawResult): EVMEvent => ({
                                return_values: JSON.stringify(ev.returnValues),
                                raw_data: ev.raw.data,
                                raw_topics: ev.raw.topics,
                                event: ev.event,
                                signature: ev.signature,
                                log_index: ev.logIndex,
                                transaction_index: ev.transactionIndex,
                                transaction_hash: ev.transactionHash,
                                block_hash: ev.blockHash,
                                block_number: ev.blockNumber,
                                address: ev.address,
                            }),
                        ),
                    }),
                ),
            ).called();
        });

        it('should fail on creation error', async function() {
            const job: Partial<Job> = {
                data: {
                    blockNumber: 99,
                },
                progress: async () => {},
            };

            const rawEvents = [
                {
                    logIndex: 0,
                    transactionIndex: 0,
                    transactionHash:
                        '0x54ac26f354aadb32efafb927b3cf5f7a9223006f076760d799321989cf2e28b6',
                    blockHash:
                        '0x8a05e695944e5566e8a54c8bc23d6e7edd4a326b2e791e90486b5ea2101145d1',
                    blockNumber: 34,
                    address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                    type: 'mined',
                    id: 'log_0f692965',
                    returnValues: {
                        '0':
                            '0x58d7c741e1121265d8f8cfbadad5bb4b1cfb8ed466f533005108cefdf8b89627',
                        '1': '0xc05187f1ec1a88bA07A880AcE290ebE1b0941D9F',
                        '2': '@event/modules',
                        id:
                            '0x58d7c741e1121265d8f8cfbadad5bb4b1cfb8ed466f533005108cefdf8b89627',
                        owner: '0xc05187f1ec1a88bA07A880AcE290ebE1b0941D9F',
                        controllers: '@event/modules',
                    },
                    event: 'NewGroup',
                    signature:
                        '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                    raw: {
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                        topics: [
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                            '0x58d7c741e1121265d8f8cfbadad5bb4b1cfb8ed466f533005108cefdf8b89627',
                            '0x000000000000000000000000c05187f1ec1a88ba07a880ace290ebe1b0941d9f',
                        ],
                    },
                },
            ];

            const eventSetEntity = {
                artifact_name: 't721controller::T721Controller_v0',
                event_name: 'NewGroup',
                block_number: 34,
                events: [
                    {
                        return_values:
                            '{"0":"0x58d7c741e1121265d8f8cfbadad5bb4b1cfb8ed466f533005108cefdf8b89627","1":"0xc05187f1ec1a88bA07A880AcE290ebE1b0941D9F","2":"@event/modules","id":"0x58d7c741e1121265d8f8cfbadad5bb4b1cfb8ed466f533005108cefdf8b89627","owner":"0xc05187f1ec1a88bA07A880AcE290ebE1b0941D9F","controllers":"@event/modules"}',
                        raw_data:
                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                        raw_topics: [
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                            '0x58d7c741e1121265d8f8cfbadad5bb4b1cfb8ed466f533005108cefdf8b89627',
                            '0x000000000000000000000000c05187f1ec1a88ba07a880ace290ebe1b0941d9f',
                        ],
                        event: 'NewGroup',
                        signature:
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                        log_index: 0,
                        transaction_index: 0,
                        transaction_hash:
                            '0x54ac26f354aadb32efafb927b3cf5f7a9223006f076760d799321989cf2e28b6',
                        block_hash:
                            '0x8a05e695944e5566e8a54c8bc23d6e7edd4a326b2e791e90486b5ea2101145d1',
                        block_number: 34,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                    },
                ],
            };

            const artifactName = 't721c::T721Controller_v0';

            const spied = spy(context.evmEventControllerBase);

            when(spied.fetch(99, 99)).thenResolve(rawEvents);

            when(context.contractsControllerMock.getArtifactName()).thenReturn(
                artifactName,
            );

            when(
                context.evmEventSetsServiceMock.create(
                    deepEqual({
                        artifact_name: artifactName,
                        event_name: 'NewGroup',
                        block_number: 99,
                        events: rawEvents.map(
                            (ev: EVMEventRawResult): EVMEvent => ({
                                return_values: JSON.stringify(ev.returnValues),
                                raw_data: ev.raw.data,
                                raw_topics: ev.raw.topics,
                                event: ev.event,
                                signature: ev.signature,
                                log_index: ev.logIndex,
                                transaction_index: ev.transactionIndex,
                                transaction_hash: ev.transactionHash,
                                block_hash: ev.blockHash,
                                block_number: ev.blockNumber,
                                address: ev.address,
                            }),
                        ),
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.evmEventControllerBase.fetchEVMEventsForBlock(
                    job as Job,
                ),
            ).rejects.toMatchObject(
                new Error(
                    `EVMEvemtControllerBase::fetchEVMEventsForBlock | Unable to create evmeventset: unexpected_error`,
                ),
            );

            verify(spied.fetch(99, 99)).called();

            verify(context.contractsControllerMock.getArtifactName()).called();

            verify(
                context.evmEventSetsServiceMock.create(
                    deepEqual({
                        artifact_name: artifactName,
                        event_name: 'NewGroup',
                        block_number: 99,
                        events: rawEvents.map(
                            (ev: EVMEventRawResult): EVMEvent => ({
                                return_values: JSON.stringify(ev.returnValues),
                                raw_data: ev.raw.data,
                                raw_topics: ev.raw.topics,
                                event: ev.event,
                                signature: ev.signature,
                                log_index: ev.logIndex,
                                transaction_index: ev.transactionIndex,
                                transaction_hash: ev.transactionHash,
                                block_hash: ev.blockHash,
                                block_number: ev.blockNumber,
                                address: ev.address,
                            }),
                        ),
                    }),
                ),
            ).called();
        });
    });

    describe('onModuleInit', function() {
        it('should register for worker master', async function() {
            const signature: Partial<InstanceSignature> = {
                name: 'worker',
                master: true,
            };

            const artifactName = 't721c::T721Controller_v0';
            const fetchJobName = `@@evmantenna/fetchEVMEventsForBlock/${artifactName}/NewGroup`;

            when(
                context.outrospectionServiceMock.getInstanceSignature(),
            ).thenResolve(signature as InstanceSignature);
            when(
                context.scheduleMock.scheduleIntervalJob(
                    `${artifactName}::NewGroup`,
                    1000,
                    anything(),
                ),
            ).thenReturn();
            when(
                context.queueMock.process(fetchJobName, 1, anything()),
            ).thenResolve();

            await context.evmEventControllerBase.onModuleInit();

            verify(
                context.outrospectionServiceMock.getInstanceSignature(),
            ).called();
            verify(
                context.scheduleMock.scheduleIntervalJob(
                    `${artifactName}::NewGroup`,
                    1000,
                    anything(),
                ),
            ).called();
            verify(
                context.queueMock.process(fetchJobName, 1, anything()),
            ).called();
        });

        it('should shutdown on bull queue throw for worker master', async function() {
            const signature: Partial<InstanceSignature> = {
                name: 'worker',
                master: true,
            };

            const artifactName = 't721c::T721Controller_v0';
            const fetchJobName = `@@evmantenna/fetchEVMEventsForBlock/${artifactName}/NewGroup`;

            when(
                context.outrospectionServiceMock.getInstanceSignature(),
            ).thenResolve(signature as InstanceSignature);
            when(
                context.scheduleMock.scheduleIntervalJob(
                    `${artifactName}::NewGroup`,
                    1000,
                    anything(),
                ),
            ).thenReturn();
            when(
                context.queueMock.process(fetchJobName, 1, anything()),
            ).thenReject(new Error('unexpected error'));

            await context.evmEventControllerBase.onModuleInit();

            verify(
                context.outrospectionServiceMock.getInstanceSignature(),
            ).called();
            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new Error('unexpected error')),
                ),
            ).called();
            verify(
                context.scheduleMock.scheduleIntervalJob(
                    `${artifactName}::NewGroup`,
                    1000,
                    anything(),
                ),
            ).called();
            verify(
                context.queueMock.process(fetchJobName, 1, anything()),
            ).called();
        });

        it('should register for worker non master', async function() {
            const signature: Partial<InstanceSignature> = {
                name: 'worker',
                master: false,
            };

            const artifactName = 't721c::T721Controller_v0';
            const fetchJobName = `@@evmantenna/fetchEVMEventsForBlock/${artifactName}/NewGroup`;

            when(
                context.outrospectionServiceMock.getInstanceSignature(),
            ).thenResolve(signature as InstanceSignature);
            when(
                context.scheduleMock.scheduleIntervalJob(
                    `${artifactName}::NewGroup`,
                    1000,
                    anything(),
                ),
            ).thenReturn();
            when(
                context.queueMock.process(fetchJobName, 1, anything()),
            ).thenResolve();

            await context.evmEventControllerBase.onModuleInit();

            verify(
                context.outrospectionServiceMock.getInstanceSignature(),
            ).called();
            verify(
                context.scheduleMock.scheduleIntervalJob(
                    `${artifactName}::NewGroup`,
                    1000,
                    anything(),
                ),
            ).never();
            verify(
                context.queueMock.process(fetchJobName, 1, anything()),
            ).called();
        });

        it('should register for server non master', async function() {
            const signature: Partial<InstanceSignature> = {
                name: 'server',
                master: false,
            };

            const artifactName = 't721c::T721Controller_v0';
            const fetchJobName = `@@evmantenna/fetchEVMEventsForBlock/${artifactName}/NewGroup`;

            when(
                context.outrospectionServiceMock.getInstanceSignature(),
            ).thenResolve(signature as InstanceSignature);
            when(
                context.scheduleMock.scheduleIntervalJob(
                    `${artifactName}::NewGroup`,
                    1000,
                    anything(),
                ),
            ).thenReturn();
            when(
                context.queueMock.process(fetchJobName, 1, anything()),
            ).thenResolve();

            await context.evmEventControllerBase.onModuleInit();

            verify(
                context.outrospectionServiceMock.getInstanceSignature(),
            ).called();
            verify(
                context.scheduleMock.scheduleIntervalJob(
                    `${artifactName}::NewGroup`,
                    1000,
                    anything(),
                ),
            ).never();
            verify(
                context.queueMock.process(fetchJobName, 1, anything()),
            ).never();
        });
    });
});
