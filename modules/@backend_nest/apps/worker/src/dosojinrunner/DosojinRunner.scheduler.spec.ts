import { DosojinRunnerScheduler } from '@app/worker/dosojinrunner/DosojinRunner.scheduler';
import { Schedule } from 'nest-schedule';
import { Job, JobOptions } from 'bull';
import { InstanceSignature, OutrospectionService }              from '@lib/common/outrospection/Outrospection.service';
import { GemOrdersService }                                     from '@lib/common/gemorders/GemOrders.service';
import { ShutdownService }                                      from '@lib/common/shutdown/Shutdown.service';
import { anyFunction, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test }                                                 from '@nestjs/testing';
import { getQueueToken }                                        from '@nestjs/bull';
import { CircuitContainerBase }                                 from '@app/worker/dosojinrunner/circuits/CircuitContainer.base';
import { GemOrderEntity }                                       from '@lib/common/gemorders/entities/GemOrder.entity';
import { UserDto }                                              from '@lib/common/users/dto/User.dto';
import { Gem }                                                  from 'dosojin';
import { ESSearchReturn }                                       from '@lib/common/utils/ESSearchReturn.type';
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

describe('DosojinRunner Scheduler', function() {
    const context: {
        dosojinRunnerScheduler: DosojinRunnerScheduler;
        scheduleMock: Schedule;
        outrospectionServiceMock: OutrospectionService;
        gemOrdersServiceMock: GemOrdersService;
        dosojinQueueMock: QueueMock;
        shutdownServiceMock: ShutdownService;

        circuitContainerMock: CircuitContainerBase;
    } = {
        dosojinRunnerScheduler: null,
        scheduleMock: null,
        outrospectionServiceMock: null,
        gemOrdersServiceMock: null,
        dosojinQueueMock: null,
        shutdownServiceMock: null,

        circuitContainerMock: null,
    };

    beforeEach(async function() {
        context.scheduleMock = mock(Schedule);
        context.outrospectionServiceMock = mock(OutrospectionService);
        context.gemOrdersServiceMock = mock(GemOrdersService);
        context.dosojinQueueMock = mock(QueueMock);
        context.shutdownServiceMock = mock(ShutdownService);

        context.circuitContainerMock = mock(CircuitContainerBase);
        when(context.circuitContainerMock.name).thenReturn('token_minter');

        DosojinRunnerScheduler.register(instance(context.circuitContainerMock));

        const app = await Test.createTestingModule({
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
                    provide: GemOrdersService,
                    useValue: instance(context.gemOrdersServiceMock),
                },
                {
                    provide: getQueueToken('dosojin'),
                    useValue: instance(context.dosojinQueueMock),
                },
                {
                    provide: ShutdownService,
                    useValue: instance(context.shutdownServiceMock),
                },
                DosojinRunnerScheduler,
            ],
        }).compile();

        context.dosojinRunnerScheduler = app.get<DosojinRunnerScheduler>(DosojinRunnerScheduler);
    });

    describe('register', function() {
        it('should register a mock circuit container', async function() {
            expect((DosojinRunnerScheduler as any).circuits).toEqual([instance(context.circuitContainerMock)]);
        });
    });

    describe('gemRunnerPoller', function() {
        const esQuery = {
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    initialized: true,
                                },
                            },
                            {
                                nested: {
                                    path: 'gem',
                                    query: {
                                        bool: {
                                            must: {
                                                term: {
                                                    'gem.gem_status': 'Running',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                        filter: {
                            script: {
                                script: {
                                    source: `
                                            if (doc.containsKey('refresh_timer') && !doc['refresh_timer'].empty) {
                                                if (Math.abs(System.currentTimeMillis() - doc['updated_at'].date.getMillis()) < doc['refresh_timer'].value) {
                                                    return false;
                                                }
                                            } else {
                                                if (Math.abs(System.currentTimeMillis() - doc['updated_at'].date.getMillis()) < params.defaultTimer) {
                                                    return false;
                                                }
                                            }
                                            return true;
                                    `,
                                    lang: 'painless',
                                    params: {
                                        defaultTimer: 1000,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        };

        it('should dispatch a gem to run', async function() {
            const gem = new Gem();
            const rawGem = GemOrderEntity.fromDosojinRaw(gem.raw);

            const gemOrder: GemOrderEntity = {
                id: 'gemorderid',

                distribution_id: 123,

                circuit_name: 'token_minter',

                initial_arguments: JSON.stringify({
                    name: 'hi',
                }),

                gem: rawGem,
            } as GemOrderEntity;

            const esSearchReturn: ESSearchReturn<GemOrderEntity> = {
                hits: {
                    total: 1,
                    hits: [
                        {
                            _source: gemOrder,
                        },
                    ],
                },
            } as ESSearchReturn<GemOrderEntity>;

            when(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: null,
                response: esSearchReturn,
            });

            when(context.dosojinQueueMock.getJobs(deepEqual(['waiting', 'active']))).thenResolve([]);

            await context.dosojinRunnerScheduler.gemRunnerPoller();

            verify(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).called();

            verify(context.dosojinQueueMock.getJobs(deepEqual(['waiting', 'active']))).called();

            verify(
                context.dosojinQueueMock.add(
                    `@@dosojin/token_minter/run`,
                    deepEqual({
                        orderId: gemOrder.id,
                    }),
                ),
            ).called();
        });

        it('should fail on gem query error', async function() {
            const gem = new Gem();
            const rawGem = GemOrderEntity.fromDosojinRaw(gem.raw);

            const gemOrder: GemOrderEntity = {
                id: 'gemorderid',

                distribution_id: 123,

                circuit_name: 'token_minter',

                initial_arguments: JSON.stringify({
                    name: 'hi',
                }),

                gem: rawGem,
            } as GemOrderEntity;

            const esSearchReturn: ESSearchReturn<GemOrderEntity> = {
                hits: {
                    total: 1,
                    hits: [
                        {
                            _source: gemOrder,
                        },
                    ],
                },
            } as ESSearchReturn<GemOrderEntity>;

            when(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await context.dosojinRunnerScheduler.gemRunnerPoller();

            verify(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).called();

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new NestError(`Error while recovering gems to dispatch: unexpected_error`)),
                ),
            ).called();
        });

        it('should interrupt on empty gem query', async function() {
            const gem = new Gem();
            const rawGem = GemOrderEntity.fromDosojinRaw(gem.raw);

            const esSearchReturn: ESSearchReturn<GemOrderEntity> = {
                hits: {
                    total: 0,
                    hits: [],
                },
            } as ESSearchReturn<GemOrderEntity>;

            when(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: null,
                response: esSearchReturn,
            });

            await context.dosojinRunnerScheduler.gemRunnerPoller();

            verify(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).called();
        });

        it('should not dispatch a gem to run (already in queue)', async function() {
            const gem = new Gem();
            const rawGem = GemOrderEntity.fromDosojinRaw(gem.raw);

            const gemOrder: GemOrderEntity = {
                id: 'gemorderid',

                distribution_id: 123,

                circuit_name: 'token_minter',

                initial_arguments: JSON.stringify({
                    name: 'hi',
                }),

                gem: rawGem,
            } as GemOrderEntity;

            const esSearchReturn: ESSearchReturn<GemOrderEntity> = {
                hits: {
                    total: 1,
                    hits: [
                        {
                            _source: gemOrder,
                        },
                    ],
                },
            } as ESSearchReturn<GemOrderEntity>;

            when(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: null,
                response: esSearchReturn,
            });

            when(context.dosojinQueueMock.getJobs(deepEqual(['waiting', 'active']))).thenResolve([
                {
                    data: {
                        orderId: gemOrder.id,
                    },
                },
            ]);

            await context.dosojinRunnerScheduler.gemRunnerPoller();

            verify(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).called();

            verify(context.dosojinQueueMock.getJobs(deepEqual(['waiting', 'active']))).called();

            verify(
                context.dosojinQueueMock.add(
                    `@@dosojin/token_minter/run`,
                    deepEqual({
                        orderId: gemOrder.id,
                    }),
                ),
            ).never();
        });
    });

    describe('gemInitializerPoller', function() {
        const esQuery = {
            body: {
                query: {
                    bool: {
                        must: {
                            term: {
                                initialized: false,
                            },
                        },
                    },
                },
            },
        };

        it('should initialize a gem', async function() {
            const user: UserDto = {
                id: 'userid',
            } as UserDto;

            const gemOrder: GemOrderEntity = {
                id: 'gemorderid',

                initialized: false,

                distribution_id: 123,

                circuit_name: 'token_minter',

                initial_arguments: JSON.stringify({
                    name: 'hi',
                }),

                gem: null,
            } as GemOrderEntity;

            const esSearchReturn: ESSearchReturn<GemOrderEntity> = {
                hits: {
                    total: 1,
                    hits: [
                        {
                            _source: gemOrder,
                        },
                    ],
                },
            } as ESSearchReturn<GemOrderEntity>;

            when(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: null,
                response: esSearchReturn,
            });

            when(context.dosojinQueueMock.getJobs(deepEqual(['active', 'waiting']))).thenResolve([]);

            await context.dosojinRunnerScheduler.gemInitializerPoller();

            verify(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).called();

            verify(context.dosojinQueueMock.getJobs(deepEqual(['active', 'waiting']))).called();

            verify(
                context.dosojinQueueMock.add(
                    `@@dosojin/token_minter/initialization`,
                    deepEqual({
                        orderId: gemOrder.id,
                        args: JSON.parse(gemOrder.initial_arguments),
                    }),
                ),
            ).called();
        });

        it('should initialize a gem without initial args', async function() {
            const gemOrder: GemOrderEntity = {
                id: 'gemorderid',

                initialized: false,

                distribution_id: 123,

                circuit_name: 'token_minter',

                initial_arguments: null,

                gem: null,
            } as GemOrderEntity;

            const esSearchReturn: ESSearchReturn<GemOrderEntity> = {
                hits: {
                    total: 1,
                    hits: [
                        {
                            _source: gemOrder,
                        },
                    ],
                },
            } as ESSearchReturn<GemOrderEntity>;

            when(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: null,
                response: esSearchReturn,
            });

            when(context.dosojinQueueMock.getJobs(deepEqual(['active', 'waiting']))).thenResolve([]);

            await context.dosojinRunnerScheduler.gemInitializerPoller();

            verify(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).called();

            verify(context.dosojinQueueMock.getJobs(deepEqual(['active', 'waiting']))).called();

            verify(
                context.dosojinQueueMock.add(
                    `@@dosojin/token_minter/initialization`,
                    deepEqual({
                        orderId: gemOrder.id,
                        args: null,
                    }),
                ),
            );
        });

        it('should fail on gem fetch error', async function() {
            when(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await context.dosojinRunnerScheduler.gemInitializerPoller();

            verify(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).called();

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new NestError(`Unable to fetch gem orders for initialization: unexpected_error`)),
                ),
            );
        });

        it('should interrupt because gem already in queue', async function() {
            const gemOrder: GemOrderEntity = {
                id: 'gemorderid',

                initialized: false,

                distribution_id: 123,

                circuit_name: 'token_minter',

                initial_arguments: JSON.stringify({
                    name: 'hi',
                }),

                gem: null,
            } as GemOrderEntity;

            const esSearchReturn: ESSearchReturn<GemOrderEntity> = {
                hits: {
                    total: 1,
                    hits: [
                        {
                            _source: gemOrder,
                        },
                    ],
                },
            } as ESSearchReturn<GemOrderEntity>;

            when(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: null,
                response: esSearchReturn,
            });

            when(context.dosojinQueueMock.getJobs(deepEqual(['active', 'waiting']))).thenResolve([
                {
                    data: {
                        orderId: gemOrder.id,
                    },
                },
            ]);

            await context.dosojinRunnerScheduler.gemInitializerPoller();

            verify(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).called();

            verify(context.dosojinQueueMock.getJobs(deepEqual(['active', 'waiting']))).called();

            verify(
                context.dosojinQueueMock.add(
                    `@@dosojin/token_minter/initialization`,
                    deepEqual({
                        orderId: gemOrder.id,
                        args: JSON.parse(gemOrder.initial_arguments),
                    }),
                ),
            ).never();
        });

        it('should set error on unknown circuit', async function() {
            const gemOrder: GemOrderEntity = {
                id: 'gemorderid',

                initialized: false,

                distribution_id: 123,

                circuit_name: 'token_minter_bis',

                initial_arguments: JSON.stringify({
                    name: 'hi',
                }),

                gem: null,
            } as GemOrderEntity;

            const gem = new Gem().setGemStatus('Fatal');

            const rawGem = gem.raw;

            rawGem.error_info = {
                dosojin: null,
                layer: null,
                entity_name: null,
                entity_type: null,
                message: `Unknown circuit token_minter_bis`,
            };

            const esSearchReturn: ESSearchReturn<GemOrderEntity> = {
                hits: {
                    total: 1,
                    hits: [
                        {
                            _source: gemOrder,
                        },
                    ],
                },
            } as ESSearchReturn<GemOrderEntity>;

            when(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: null,
                response: esSearchReturn,
            });

            when(context.dosojinQueueMock.getJobs(deepEqual(['active', 'waiting']))).thenResolve([]);

            when(
                context.gemOrdersServiceMock.update(
                    deepEqual({
                        id: gemOrder.id,
                    }),
                    deepEqual({
                        gem: GemOrderEntity.fromDosojinRaw(rawGem),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.dosojinRunnerScheduler.gemInitializerPoller();

            verify(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).called();

            verify(context.dosojinQueueMock.getJobs(deepEqual(['active', 'waiting']))).called();

            verify(
                context.dosojinQueueMock.add(
                    `@@dosojin/token_minter/initialization`,
                    deepEqual({
                        orderId: gemOrder.id,
                        args: JSON.parse(gemOrder.initial_arguments),
                    }),
                ),
            ).never();
        });

        it('should fail on error gem update', async function() {
            const gemOrder: GemOrderEntity = {
                id: 'gemorderid',

                initialized: false,

                distribution_id: 123,

                circuit_name: 'token_minter_bis',

                initial_arguments: JSON.stringify({
                    name: 'hi',
                }),

                gem: null,
            } as GemOrderEntity;

            const gem = new Gem().setGemStatus('Fatal');

            const rawGem = gem.raw;

            rawGem.error_info = {
                dosojin: null,
                layer: null,
                entity_name: null,
                entity_type: null,
                message: `Unknown circuit token_minter_bis`,
            };

            const esSearchReturn: ESSearchReturn<GemOrderEntity> = {
                hits: {
                    total: 1,
                    hits: [
                        {
                            _source: gemOrder,
                        },
                    ],
                },
            } as ESSearchReturn<GemOrderEntity>;

            when(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).thenResolve({
                error: null,
                response: esSearchReturn,
            });

            when(context.dosojinQueueMock.getJobs(deepEqual(['active', 'waiting']))).thenResolve([]);

            when(
                context.gemOrdersServiceMock.update(
                    deepEqual({
                        id: gemOrder.id,
                    }),
                    deepEqual({
                        gem: GemOrderEntity.fromDosojinRaw(rawGem),
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await context.dosojinRunnerScheduler.gemInitializerPoller();

            verify(context.gemOrdersServiceMock.searchElastic(deepEqual(esQuery))).called();

            verify(context.dosojinQueueMock.getJobs(deepEqual(['active', 'waiting']))).called();

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new NestError(`Unable to signal gem initialization error: unexpected_error`)),
                ),
            ).called();

            verify(
                context.dosojinQueueMock.add(
                    `@@dosojin/token_minter/initialization`,
                    deepEqual({
                        orderId: gemOrder.id,
                        args: JSON.parse(gemOrder.initial_arguments),
                    }),
                ),
            ).never();
        });
    });

    describe('onApplicationBootstrap', function() {
        it('should register jobs as master worker', async function() {
            const signature: InstanceSignature = {
                name: 'worker',
                master: true,
            } as InstanceSignature;

            when(context.outrospectionServiceMock.getInstanceSignature()).thenResolve(signature);

            await context.dosojinRunnerScheduler.onApplicationBootstrap();

            verify(context.scheduleMock.scheduleIntervalJob('gemInitializerPoller', 100, anyFunction())).called();
            verify(context.scheduleMock.scheduleIntervalJob('gemRunnerPoller', 100, anyFunction())).called();
        });

        it('should register no jobs as non master worker', async function() {
            const signature: InstanceSignature = {
                name: 'worker',
                master: false,
            } as InstanceSignature;

            when(context.outrospectionServiceMock.getInstanceSignature()).thenResolve(signature);

            await context.dosojinRunnerScheduler.onApplicationBootstrap();

            verify(context.scheduleMock.scheduleIntervalJob('gemInitializerPoller', 100, anyFunction())).never();
            verify(context.scheduleMock.scheduleIntervalJob('gemRunnerPoller', 100, anyFunction())).never();
        });
    });
});
