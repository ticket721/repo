import { BN, Circuit, Gem } from 'dosojin';
import Joi, { ObjectSchema, string } from '@hapi/joi';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { InstanceSignature, OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { Job, JobOptions, Queue } from 'bull';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { GemOrdersService } from '@lib/common/gemorders/GemOrders.service';
import {
    CircuitContainerBase,
    GemInitializationJob,
    GemRunJob,
} from '@app/worker/dosojinrunner/circuits/CircuitContainer.base';
import { anyFunction, anything, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { GemOrderEntity } from '@lib/common/gemorders/entities/GemOrder.entity';
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

const obj = Joi.object({
    name: string(),
});

describe('CircuitContainer Controller Base', function() {
    const context: {
        circuitContainerBase: CircuitContainerBase;
        circuitMock: Circuit;
        initialArgumentsVerifierMock: ObjectSchema;
        loggerMock: WinstonLoggerService;
        outrospectionServiceMock: OutrospectionService;
        dosojinQueueMock: QueueMock;
        shutdownServiceMock: ShutdownService;
        gemOrdersServiceMock: GemOrdersService;
    } = {
        circuitContainerBase: null,
        circuitMock: null,
        initialArgumentsVerifierMock: null,
        loggerMock: null,
        outrospectionServiceMock: null,
        dosojinQueueMock: null,
        shutdownServiceMock: null,
        gemOrdersServiceMock: null,
    };

    beforeEach(async function() {
        context.circuitMock = mock(Circuit);
        context.initialArgumentsVerifierMock = obj;
        context.loggerMock = mock(WinstonLoggerService);
        context.outrospectionServiceMock = mock(OutrospectionService);
        context.dosojinQueueMock = mock(QueueMock);
        context.shutdownServiceMock = mock(ShutdownService);
        context.gemOrdersServiceMock = mock(GemOrdersService);

        when(context.circuitMock.name).thenReturn('token_minter');

        context.circuitContainerBase = new CircuitContainerBase(
            instance(context.circuitMock),
            context.initialArgumentsVerifierMock,
            instance(context.loggerMock),
            instance(context.outrospectionServiceMock),
            instance(context.dosojinQueueMock) as Queue,
            instance(context.shutdownServiceMock),
            instance(context.gemOrdersServiceMock),
        );
    });

    describe('name', function() {
        it('should recover circuit name', async function() {
            expect(context.circuitContainerBase.name).toEqual('token_minter');
        });
    });

    describe('initialize', function() {
        it('should try to initialize', async function() {
            await expect(context.circuitContainerBase.initialize(null)).rejects.toMatchObject(
                new NestError(
                    `CircuitContainerBase::initialize | token_minter has no custom initialization, each cicuit should implement its unique gem initialization`,
                ),
            );
        });
    });

    describe('run', function() {
        it('should run circuit', async function() {
            const gemMock = mock(Gem);

            when(context.circuitMock.run(instance(gemMock))).thenResolve(instance(gemMock));

            await context.circuitContainerBase.run(instance(gemMock));
        });
    });

    describe('completeDryRun', function() {
        it('should complete dry run circuit', async function() {
            const gemMock = mock(Gem);

            when(context.circuitMock.dryRun(instance(gemMock))).thenResolve(instance(gemMock));

            await context.circuitContainerBase.completeDryRun(instance(gemMock));
        });
    });

    describe('runTask', function() {
        it('should run task', async function() {
            const gem = new Gem().setGemStatus('Running');

            gem.pushHistoryEntity({
                dosojin: 'Dosojin',
                entityType: 'operator',
                entityName: 'DosojinOperator',
                layer: 0,
                count: 1,
            });

            const rawGem = GemOrderEntity.fromDosojinRaw(gem.raw);

            const orderId = 'orderid';

            const gemOrderEntity: GemOrderEntity = {
                circuit_name: 'token_minter',
                gem: rawGem,
            } as GemOrderEntity;

            const job: Job<GemRunJob> = {
                data: {
                    orderId,
                },
            } as Job<GemRunJob>;

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: orderId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [gemOrderEntity],
            });

            when(context.circuitMock.run(deepEqual(gem))).thenResolve(gem);

            when(
                context.gemOrdersServiceMock.update(
                    deepEqual({
                        id: orderId,
                    }),
                    deepEqual({
                        gem: rawGem,
                        refresh_timer: rawGem.refresh_timer,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.circuitContainerBase.runTask(job);

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: orderId,
                    }),
                ),
            ).called();

            verify(context.circuitMock.run(deepEqual(gem))).called();

            verify(
                context.gemOrdersServiceMock.update(
                    deepEqual({
                        id: orderId,
                    }),
                    deepEqual({
                        gem: rawGem,
                        refresh_timer: rawGem.refresh_timer,
                    }),
                ),
            ).called();
        });

        it('should fail on order fetch fail', async function() {
            const gem = new Gem().setGemStatus('Running');

            gem.pushHistoryEntity({
                dosojin: 'Dosojin',
                entityType: 'operator',
                entityName: 'DosojinOperator',
                layer: 0,
                count: 1,
            });

            const rawGem = GemOrderEntity.fromDosojinRaw(gem.raw);

            const orderId = 'orderid';

            const gemOrderEntity: GemOrderEntity = {
                circuit_name: 'token_minter',
                gem: rawGem,
            } as GemOrderEntity;

            const job: Job<GemRunJob> = {
                data: {
                    orderId,
                },
            } as Job<GemRunJob>;

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: orderId,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await context.circuitContainerBase.runTask(job);

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: orderId,
                    }),
                ),
            ).called();

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new NestError(`Unable to fetch / find gem order ${orderId}: unexpected_error`)),
                ),
            ).called();
        });

        it('should fail on empty order fetch', async function() {
            const gem = new Gem().setGemStatus('Running');

            gem.pushHistoryEntity({
                dosojin: 'Dosojin',
                entityType: 'operator',
                entityName: 'DosojinOperator',
                layer: 0,
                count: 1,
            });

            const rawGem = GemOrderEntity.fromDosojinRaw(gem.raw);

            const orderId = 'orderid';

            const gemOrderEntity: GemOrderEntity = {
                circuit_name: 'token_minter',
                gem: rawGem,
            } as GemOrderEntity;

            const job: Job<GemRunJob> = {
                data: {
                    orderId,
                },
            } as Job<GemRunJob>;

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: orderId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            await context.circuitContainerBase.runTask(job);

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: orderId,
                    }),
                ),
            ).called();

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new NestError(`Unable to fetch / find gem order ${orderId}: empty result`)),
                ),
            ).called();
        });

        it('should fail on invalid circuit name', async function() {
            const gem = new Gem().setGemStatus('Running');

            gem.pushHistoryEntity({
                dosojin: 'Dosojin',
                entityType: 'operator',
                entityName: 'DosojinOperator',
                layer: 0,
                count: 1,
            });

            const rawGem = GemOrderEntity.fromDosojinRaw(gem.raw);

            const orderId = 'orderid';

            const gemOrderEntity: GemOrderEntity = {
                circuit_name: 'token_minter_bis',
                gem: rawGem,
            } as GemOrderEntity;

            const job: Job<GemRunJob> = {
                data: {
                    orderId,
                },
            } as Job<GemRunJob>;

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: orderId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [gemOrderEntity],
            });

            await expect(context.circuitContainerBase.runTask(job)).rejects.toMatchObject(
                new NestError(`Invalid gem for circuit token_minter set to circuit token_minter_bis`),
            );

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: orderId,
                    }),
                ),
            ).called();
        });

        it('should fail on uninitialized gem', async function() {
            const gem = new Gem().setGemStatus('Running');

            gem.pushHistoryEntity({
                dosojin: 'Dosojin',
                entityType: 'operator',
                entityName: 'DosojinOperator',
                layer: 0,
                count: 1,
            });

            const rawGem = GemOrderEntity.fromDosojinRaw(gem.raw);

            const orderId = 'orderid';

            const gemOrderEntity: GemOrderEntity = {
                circuit_name: 'token_minter',
                gem: rawGem,
                initialized: false,
            } as GemOrderEntity;

            const job: Job<GemRunJob> = {
                data: {
                    orderId,
                },
            } as Job<GemRunJob>;

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: orderId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [gemOrderEntity],
            });

            await expect(context.circuitContainerBase.runTask(job)).rejects.toMatchObject(
                new NestError(`Invalid gem for circuit token_minter set to circuit token_minter`),
            );

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: orderId,
                    }),
                ),
            ).called();
        });

        it('should interrupt on invalid gem status', async function() {
            const gem = new Gem().setGemStatus('Fatal');

            gem.pushHistoryEntity({
                dosojin: 'Dosojin',
                entityType: 'operator',
                entityName: 'DosojinOperator',
                layer: 0,
                count: 1,
            });

            const rawGem = GemOrderEntity.fromDosojinRaw(gem.raw);

            const orderId = 'orderid';

            const gemOrderEntity: GemOrderEntity = {
                circuit_name: 'token_minter',
                gem: rawGem,
            } as GemOrderEntity;

            const job: Job<GemRunJob> = {
                data: {
                    orderId,
                },
            } as Job<GemRunJob>;

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: orderId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [gemOrderEntity],
            });

            await context.circuitContainerBase.runTask(job);

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: orderId,
                    }),
                ),
            ).called();

            verify(context.loggerMock.log(`Interrupted run with Gem for invalid status reasons: Fatal`)).called();
        });

        it('should fail on uninitialized gem in entity', async function() {
            const gem = new Gem().setGemStatus('Running');

            gem.pushHistoryEntity({
                dosojin: 'Dosojin',
                entityType: 'operator',
                entityName: 'DosojinOperator',
                layer: 0,
                count: 1,
            });

            const orderId = 'orderid';

            const gemOrderEntity: GemOrderEntity = {
                circuit_name: 'token_minter',
                gem: null,
            } as GemOrderEntity;

            const job: Job<GemRunJob> = {
                data: {
                    orderId,
                },
            } as Job<GemRunJob>;

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: orderId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [gemOrderEntity],
            });

            await expect(context.circuitContainerBase.runTask(job)).rejects.toMatchObject(
                new NestError(`Cannot process uninitialized gem order: ${orderId}`),
            );

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: orderId,
                    }),
                ),
            ).called();
        });

        it('should fail on run fail', async function() {
            const gem = new Gem().setGemStatus('Running');

            gem.pushHistoryEntity({
                dosojin: 'Dosojin',
                entityType: 'operator',
                entityName: 'DosojinOperator',
                layer: 0,
                count: 1,
            });

            const rawGem = GemOrderEntity.fromDosojinRaw(gem.raw);

            const orderId = 'orderid';

            const gemOrderEntity: GemOrderEntity = {
                circuit_name: 'token_minter',
                gem: rawGem,
            } as GemOrderEntity;

            const job: Job<GemRunJob> = {
                data: {
                    orderId,
                },
            } as Job<GemRunJob>;

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: orderId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [gemOrderEntity],
            });

            when(context.circuitMock.run(anything())).thenReject(new NestError('intended error'));

            when(
                context.gemOrdersServiceMock.update(
                    deepEqual({
                        id: orderId,
                    }),
                    deepEqual({
                        gem: GemOrderEntity.fromDosojinRaw(gem.setGemStatus('Fatal').raw),
                        refresh_timer: rawGem.refresh_timer,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.circuitContainerBase.runTask(job);

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: orderId,
                    }),
                ),
            ).called();

            verify(context.circuitMock.run(deepEqual(gem))).called();

            verify(
                context.gemOrdersServiceMock.update(
                    deepEqual({
                        id: orderId,
                    }),
                    deepEqual({
                        gem: GemOrderEntity.fromDosojinRaw(gem.setGemStatus('Fatal').raw),
                        refresh_timer: rawGem.refresh_timer,
                    }),
                ),
            ).called();
        });

        it('should fail on update res', async function() {
            const gem = new Gem().setGemStatus('Running');

            gem.pushHistoryEntity({
                dosojin: 'Dosojin',
                entityType: 'operator',
                entityName: 'DosojinOperator',
                layer: 0,
                count: 1,
            });

            const rawGem = GemOrderEntity.fromDosojinRaw(gem.raw);

            const orderId = 'orderid';

            const gemOrderEntity: GemOrderEntity = {
                circuit_name: 'token_minter',
                gem: rawGem,
            } as GemOrderEntity;

            const job: Job<GemRunJob> = {
                data: {
                    orderId,
                },
            } as Job<GemRunJob>;

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: orderId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [gemOrderEntity],
            });

            when(context.circuitMock.run(deepEqual(gem))).thenResolve(gem);

            when(
                context.gemOrdersServiceMock.update(
                    deepEqual({
                        id: orderId,
                    }),
                    deepEqual({
                        gem: rawGem,
                        refresh_timer: rawGem.refresh_timer,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await context.circuitContainerBase.runTask(job);

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: orderId,
                    }),
                ),
            ).called();

            verify(context.circuitMock.run(deepEqual(gem))).called();

            verify(
                context.gemOrdersServiceMock.update(
                    deepEqual({
                        id: orderId,
                    }),
                    deepEqual({
                        gem: rawGem,
                        refresh_timer: rawGem.refresh_timer,
                    }),
                ),
            ).called();

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new NestError(`Error while updating gem after run: unexpected_error`)),
                ),
            ).called();
        });
    });

    describe('initializeTask', function() {
        it('should initialize task', async function() {
            const gem = new Gem().setGemStatus('Running').setPayloadValues({
                fiat_eur: new BN(0),
            });

            const rawGem = gem.raw;

            const spiedCircuitContainer = spy(context.circuitContainerBase);

            const orderId = 'orderId';

            const job: Job<GemInitializationJob<any>> = {
                data: {
                    args: {
                        name: 'hi',
                    },
                    orderId,
                },
            } as Job;

            when(spiedCircuitContainer.initialize(deepEqual(job.data.args))).thenResolve(gem);
            when(
                context.gemOrdersServiceMock.update(
                    deepEqual({
                        id: orderId,
                    }),
                    deepEqual({
                        initialized: true,
                        gem: GemOrderEntity.fromDosojinRaw(rawGem),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.circuitContainerBase.initializeTask(job);

            verify(spiedCircuitContainer.initialize(deepEqual(job.data.args))).called();
            verify(
                context.gemOrdersServiceMock.update(
                    deepEqual({
                        id: orderId,
                    }),
                    deepEqual({
                        initialized: true,
                        gem: GemOrderEntity.fromDosojinRaw(rawGem),
                    }),
                ),
            ).called();
        });

        it('should fail on joi init fail', async function() {
            const gem = new Gem().setGemStatus('Fatal');

            const rawGem = gem.raw;
            rawGem.error_info = {
                dosojin: null,
                entity_name: null,
                entity_type: null,
                layer: null,
                message: 'error | occured',
            };

            const spiedCircuitContainer = spy(context.circuitContainerBase);

            const orderId = 'orderId';

            const job: Job<GemInitializationJob<any>> = {
                data: {
                    args: {
                        name: 'hi',
                    },
                    orderId,
                },
            } as Job;

            when(spiedCircuitContainer.initialize(deepEqual(job.data.args))).thenReject(({
                details: [
                    {
                        message: 'error',
                    },
                    {
                        message: 'occured',
                    },
                ],
            } as any) as Error);
            when(
                context.gemOrdersServiceMock.update(
                    deepEqual({
                        id: orderId,
                    }),
                    deepEqual({
                        initialized: true,
                        gem: GemOrderEntity.fromDosojinRaw(rawGem),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.circuitContainerBase.initializeTask(job);

            verify(spiedCircuitContainer.initialize(deepEqual(job.data.args))).called();
            verify(
                context.gemOrdersServiceMock.update(
                    deepEqual({
                        id: orderId,
                    }),
                    deepEqual({
                        initialized: true,
                        gem: GemOrderEntity.fromDosojinRaw(rawGem),
                    }),
                ),
            ).called();
        });

        it('should fail on init throw', async function() {
            const gem = new Gem().setGemStatus('Fatal');

            const rawGem = gem.raw;
            rawGem.error_info = {
                dosojin: null,
                entity_name: null,
                entity_type: null,
                layer: null,
                message: 'initialization_error',
            };

            const spiedCircuitContainer = spy(context.circuitContainerBase);

            const orderId = 'orderId';

            const job: Job<GemInitializationJob<any>> = {
                data: {
                    args: {
                        name: 'hi',
                    },
                    orderId,
                },
            } as Job;

            when(spiedCircuitContainer.initialize(deepEqual(job.data.args))).thenReject(new NestError('init error'));
            when(
                context.gemOrdersServiceMock.update(
                    deepEqual({
                        id: orderId,
                    }),
                    deepEqual({
                        initialized: true,
                        gem: GemOrderEntity.fromDosojinRaw(rawGem),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.circuitContainerBase.initializeTask(job);

            verify(spiedCircuitContainer.initialize(deepEqual(job.data.args))).called();
            verify(
                context.gemOrdersServiceMock.update(
                    deepEqual({
                        id: orderId,
                    }),
                    deepEqual({
                        initialized: true,
                        gem: GemOrderEntity.fromDosojinRaw(rawGem),
                    }),
                ),
            ).called();
        });

        it('should fail on update error', async function() {
            const gem = new Gem().setGemStatus('Running').setPayloadValues({
                fiat_eur: new BN(0),
            });

            const rawGem = gem.raw;

            const spiedCircuitContainer = spy(context.circuitContainerBase);

            const orderId = 'orderId';

            const job: Job<GemInitializationJob<any>> = {
                data: {
                    args: {
                        name: 'hi',
                    },
                    orderId,
                },
            } as Job;

            when(spiedCircuitContainer.initialize(deepEqual(job.data.args))).thenResolve(gem);
            when(
                context.gemOrdersServiceMock.update(
                    deepEqual({
                        id: orderId,
                    }),
                    deepEqual({
                        initialized: true,
                        gem: GemOrderEntity.fromDosojinRaw(rawGem),
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await context.circuitContainerBase.initializeTask(job);

            verify(spiedCircuitContainer.initialize(deepEqual(job.data.args))).called();
            verify(
                context.gemOrdersServiceMock.update(
                    deepEqual({
                        id: orderId,
                    }),
                    deepEqual({
                        initialized: true,
                        gem: GemOrderEntity.fromDosojinRaw(rawGem),
                    }),
                ),
            ).called();
            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new NestError(`Error while initializing gem order ${orderId}: unexpected_error`)),
                ),
            ).called();
        });
    });

    describe('onModuleInit', function() {
        it('should register as worker', async function() {
            const signature: InstanceSignature = {
                name: 'worker',
            } as InstanceSignature;

            when(context.outrospectionServiceMock.getInstanceSignature()).thenResolve(signature);
            when(
                context.dosojinQueueMock.process(`@@dosojin/token_minter/initialization`, 1, anyFunction()),
            ).thenResolve();
            when(context.dosojinQueueMock.process(`@@dosojin/token_minter/run`, 1, anyFunction())).thenResolve();

            await context.circuitContainerBase.onModuleInit();

            verify(
                context.dosojinQueueMock.process(`@@dosojin/token_minter/initialization`, 1, anyFunction()),
            ).called();
            verify(context.dosojinQueueMock.process(`@@dosojin/token_minter/run`, 1, anyFunction())).called();
        });

        it('should register as server', async function() {
            const signature: InstanceSignature = {
                name: 'server',
            } as InstanceSignature;

            when(context.outrospectionServiceMock.getInstanceSignature()).thenResolve(signature);
            when(
                context.dosojinQueueMock.process(`@@dosojin/token_minter/initialization`, 1, anyFunction()),
            ).thenResolve();
            when(context.dosojinQueueMock.process(`@@dosojin/token_minter/run`, 1, anyFunction())).thenResolve();

            await context.circuitContainerBase.onModuleInit();

            verify(context.dosojinQueueMock.process(`@@dosojin/token_minter/initialization`, 1, anyFunction())).never();
            verify(context.dosojinQueueMock.process(`@@dosojin/token_minter/run`, 1, anyFunction())).never();
        });
    });
});
