import { EVMEventControllerBase, EVMEventRawResult } from '@app/worker/evmantenna/EVMEvent.controller.base';
import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';
import { Schedule } from 'nest-schedule';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { InstanceSignature, OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { EVMEventSetsService } from '@lib/common/evmeventsets/EVMEventSets.service';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { NestError } from '@lib/common/utils/NestError';

describe('EVMEvent Controller Base', function() {
    const context: {
        evmEventControllerBase: EVMEventControllerBase;
        contractsControllerMock: ContractsControllerBase;
        scheduleMock: Schedule;
        globalConfigServiceMock: GlobalConfigService;
        shutdownServiceMock: ShutdownService;
        outrospectionServiceMock: OutrospectionService;
        evmEventSetsServiceMock: EVMEventSetsService;
    } = {
        evmEventControllerBase: null,
        contractsControllerMock: null,
        scheduleMock: null,
        globalConfigServiceMock: null,
        shutdownServiceMock: null,
        outrospectionServiceMock: null,
        evmEventSetsServiceMock: null,
    };

    beforeEach(async function() {
        context.contractsControllerMock = mock(ContractsControllerBase);
        context.scheduleMock = mock(Schedule);
        context.globalConfigServiceMock = mock(GlobalConfigService);
        context.shutdownServiceMock = mock(ShutdownService);
        context.outrospectionServiceMock = mock(OutrospectionService);
        context.evmEventSetsServiceMock = mock(EVMEventSetsService);

        const artifactName = 't721c::T721Controller_v0';

        when(context.contractsControllerMock.getArtifactName()).thenReturn(artifactName);

        context.evmEventControllerBase = new EVMEventControllerBase(
            instance(context.contractsControllerMock),
            instance(context.scheduleMock),
            instance(context.globalConfigServiceMock),
            instance(context.shutdownServiceMock),
            instance(context.outrospectionServiceMock),
            instance(context.evmEventSetsServiceMock),
            'NewGroup',
        );
    });

    describe('rollbackableDelete', function() {
        it('should throw on unimplemented call', async function() {
            await expect(EVMEventControllerBase.rollbackableDelete(null, null, null)).rejects.toMatchObject(
                new NestError(`implement rollbackableDelete`),
            );
        });
    });

    describe('rollbackableCreate', function() {
        it('should throw on unimplemented call', async function() {
            await expect(EVMEventControllerBase.rollbackableCreate(null, null, null)).rejects.toMatchObject(
                new NestError(`implement rollbackableCreate`),
            );
        });
    });

    describe('rollbackableUpdate', function() {
        it('should create update query and its rollback query', async function() {
            const fields = {
                name: {
                    old: 'hi',
                    new: 'bye',
                },
            };

            const selector = {
                id: 'example',
            };

            const crudextension = mock(CRUDExtension);

            when(
                crudextension.dryUpdate(
                    deepEqual(selector),
                    deepEqual({
                        name: fields.name.new,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'this is the new query',
                    params: [1, 2, 3],
                },
            });

            when(
                crudextension.dryUpdate(
                    deepEqual(selector),
                    deepEqual({
                        name: fields.name.old,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'this is the old query',
                    params: [3, 2, 1],
                },
            });

            const appender = mock<any>();

            await EVMEventControllerBase.rollbackableUpdate(
                instance(crudextension),
                selector,
                fields,
                instance(appender).appender,
            );

            verify(
                crudextension.dryUpdate(
                    deepEqual(selector),
                    deepEqual({
                        name: fields.name.new,
                    }),
                ),
            ).called();

            verify(
                crudextension.dryUpdate(
                    deepEqual(selector),
                    deepEqual({
                        name: fields.name.old,
                    }),
                ),
            ).called();

            verify(
                appender.appender(
                    deepEqual({
                        query: 'this is the new query',
                        params: [1, 2, 3],
                    }),
                    deepEqual({
                        query: 'this is the old query',
                        params: [3, 2, 1],
                    }),
                ),
            ).called();
        });

        it('should fail on dry query creation fail (new)', async function() {
            const fields = {
                name: {
                    old: 'hi',
                    new: 'bye',
                },
            };

            const selector = {
                id: 'example',
            };

            const crudextension = mock(CRUDExtension);

            when(
                crudextension.dryUpdate(
                    deepEqual(selector),
                    deepEqual({
                        name: fields.name.new,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const appender = mock<any>();

            const res = await EVMEventControllerBase.rollbackableUpdate(
                instance(crudextension),
                selector,
                fields,
                instance(appender).appender,
            );

            expect(res.error).toEqual('forward_update_query_building_error');

            verify(
                crudextension.dryUpdate(
                    deepEqual(selector),
                    deepEqual({
                        name: fields.name.new,
                    }),
                ),
            ).called();
        });

        it('should fail on dry query creation fail (old)', async function() {
            const fields = {
                name: {
                    old: 'hi',
                    new: 'bye',
                },
            };

            const selector = {
                id: 'example',
            };

            const crudextension = mock(CRUDExtension);

            when(
                crudextension.dryUpdate(
                    deepEqual(selector),
                    deepEqual({
                        name: fields.name.new,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'this is the new query',
                    params: [1, 2, 3],
                },
            });

            when(
                crudextension.dryUpdate(
                    deepEqual(selector),
                    deepEqual({
                        name: fields.name.old,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const appender = mock<any>();

            const res = await EVMEventControllerBase.rollbackableUpdate(
                instance(crudextension),
                selector,
                fields,
                instance(appender).appender,
            );

            expect(res.error).toEqual(`rollback_update_query_building_error`);

            verify(
                crudextension.dryUpdate(
                    deepEqual(selector),
                    deepEqual({
                        name: fields.name.new,
                    }),
                ),
            ).called();

            verify(
                crudextension.dryUpdate(
                    deepEqual(selector),
                    deepEqual({
                        name: fields.name.old,
                    }),
                ),
            ).called();
        });
    });

    describe('artifactName', function() {
        it('should recover artifact name', async function() {
            const artifactName = 't721c::T721Controller_v0';

            when(context.contractsControllerMock.getArtifactName()).thenReturn(artifactName);
            const res = context.evmEventControllerBase.artifactName;

            expect(res).toEqual(artifactName);

            verify(context.contractsControllerMock.getArtifactName()).called();
        });
    });

    describe('convert', function() {
        it('throw, shutdown and warn about unoverriden method', async function() {
            const artifactName = 't721c::T721Controller_v0';
            const errorMsg = `Error in ${artifactName}/NewGroup | convert should be overriden`;

            when(context.contractsControllerMock.getArtifactName()).thenReturn(artifactName);

            await expect(context.evmEventControllerBase.convert(null, null)).rejects.toMatchObject(
                new NestError(errorMsg),
            );

            verify(context.contractsControllerMock.getArtifactName()).called();
            verify(context.shutdownServiceMock.shutdownWithError(deepEqual(new NestError(errorMsg)))).called();
        });
    });

    describe('fetch', function() {
        it('should fetch events', async function() {
            const artifactName = 't721c::T721Controller_v0';

            const instance = {
                getPastEvents: async (): Promise<EVMEventRawResult[]> => [],
            };

            when(context.contractsControllerMock.getArtifactName()).thenReturn(artifactName);
            when(context.contractsControllerMock.get()).thenResolve(instance);

            const res = await context.evmEventControllerBase.fetch(0, 0);
            expect(res).toEqual([]);

            verify(context.contractsControllerMock.getArtifactName()).called();
        });
    });

    describe('isHandler', function() {
        it('should return true', async function() {
            const artifactName = 't721c::T721Controller_v0';

            when(context.contractsControllerMock.getArtifactName()).thenReturn(artifactName);

            const res = await context.evmEventControllerBase.isHandler('NewGroup', artifactName);
            expect(res).toEqual(true);

            verify(context.contractsControllerMock.getArtifactName()).called();
        });

        it('should return false for invalid event name', async function() {
            const artifactName = 't721c::T721Controller_v0';

            when(context.contractsControllerMock.getArtifactName()).thenReturn(artifactName);

            const res = await context.evmEventControllerBase.isHandler('NewCategory', artifactName);
            expect(res).toEqual(false);

            verify(context.contractsControllerMock.getArtifactName()).called();
        });

        it('should return false for invalid artifact name', async function() {
            const artifactName = 't721c::T721Controller_v0';

            when(context.contractsControllerMock.getArtifactName()).thenReturn(artifactName);

            const res = await context.evmEventControllerBase.isHandler('NewGroup', 'invalid');
            expect(res).toEqual(false);

            verify(context.contractsControllerMock.getArtifactName()).called();
        });
    });

    describe('onModuleInit', function() {
        it('should register for worker master', async function() {
            const signature: Partial<InstanceSignature> = {
                name: 'worker',
                master: true,
            };

            const artifactName = 't721c::T721Controller_v0';

            when(context.outrospectionServiceMock.getInstanceSignature()).thenResolve(signature as InstanceSignature);
            when(context.scheduleMock.scheduleIntervalJob(`${artifactName}::NewGroup`, 1000, anything())).thenReturn();

            await context.evmEventControllerBase.onModuleInit();

            verify(context.outrospectionServiceMock.getInstanceSignature()).called();
            verify(context.scheduleMock.scheduleIntervalJob(`${artifactName}::NewGroup`, 1000, anything())).called();
        });

        it('should register for worker non master', async function() {
            const signature: Partial<InstanceSignature> = {
                name: 'worker',
                master: false,
            };

            const artifactName = 't721c::T721Controller_v0';

            when(context.outrospectionServiceMock.getInstanceSignature()).thenResolve(signature as InstanceSignature);
            when(context.scheduleMock.scheduleIntervalJob(`${artifactName}::NewGroup`, 1000, anything())).thenReturn();

            await context.evmEventControllerBase.onModuleInit();

            verify(context.outrospectionServiceMock.getInstanceSignature()).called();
            verify(context.scheduleMock.scheduleIntervalJob(`${artifactName}::NewGroup`, 1000, anything())).never();
        });

        it('should register for server non master', async function() {
            const signature: Partial<InstanceSignature> = {
                name: 'server',
                master: false,
            };

            const artifactName = 't721c::T721Controller_v0';

            when(context.outrospectionServiceMock.getInstanceSignature()).thenResolve(signature as InstanceSignature);
            when(context.scheduleMock.scheduleIntervalJob(`${artifactName}::NewGroup`, 1000, anything())).thenReturn();

            await context.evmEventControllerBase.onModuleInit();

            verify(context.outrospectionServiceMock.getInstanceSignature()).called();
            verify(context.scheduleMock.scheduleIntervalJob(`${artifactName}::NewGroup`, 1000, anything())).never();
        });
    });
});
