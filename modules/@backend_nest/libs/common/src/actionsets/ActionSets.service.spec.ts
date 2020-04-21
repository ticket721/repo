import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { ActionSetsRepository } from '@lib/common/actionsets/ActionSets.repository';
import { deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { getModelToken, getRepositoryToken } from '@iaminfinity/express-cassandra/dist/utils/cassandra-orm.utils';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';
import { ConfigService } from '@lib/common/config/Config.service';
import { ModuleRef } from '@nestjs/core';
import { RightsService } from '@lib/common/rights/Rights.service';
import { ActionSetBuilderBase } from '@lib/common/actionsets/helper/ActionSet.builder.base';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { Job, JobOptions } from 'bull';
import { getQueueToken } from '@nestjs/bull';

class EntityModelMock {
    search(options: EsSearchOptionsStatic, callback?: (err: any, ret: any) => void): void {
        return;
    }

    _properties = null;
}

class ModuleRefMock {
    async get(...arg: any[]): Promise<any> {
        return null;
    }
}

class AcSetBuilderBaseMock implements ActionSetBuilderBase {
    buildActionSet(caller: UserDto, args: any): Promise<ServiceResponse<ActionSet>> {
        return null;
    }
}

class QueueMock<T = any> {
    add(name: string, data: T, opts?: JobOptions): Promise<Job<T>> {
        return null;
    }
}

describe('ActionSets Service', function() {
    const context: {
        actionSetsService: ActionSetsService;
        actionSetsRepository: ActionSetsRepository;
        actionSetModel: EntityModelMock;
        configServiceMock: ConfigService;
        moduleRefMock: ModuleRefMock;
        rightsServiceMock: RightsService;
        queueMock: QueueMock;
    } = {
        actionSetsService: null,
        actionSetsRepository: null,
        actionSetModel: null,
        configServiceMock: null,
        moduleRefMock: null,
        rightsServiceMock: null,
        queueMock: null,
    };

    beforeEach(async function() {
        context.actionSetModel = mock(EntityModelMock);
        context.actionSetsRepository = mock(ActionSetsRepository);
        context.configServiceMock = mock(ConfigService);
        when(context.actionSetModel._properties).thenReturn({
            schema: {
                fields: {
                    id: {
                        type: 'uuid',
                    },
                },
            },
        });
        context.moduleRefMock = mock(ModuleRefMock);
        context.rightsServiceMock = mock(RightsService);
        context.queueMock = mock(QueueMock);

        const ConfigServiceProvider = {
            provide: ConfigService,
            useValue: instance(context.configServiceMock),
        };

        const ActionSetEntityModelProvider = {
            provide: getModelToken(ActionSetEntity),
            useValue: instance(context.actionSetModel),
        };

        const ActionSetsRepositoryProvider = {
            provide: getRepositoryToken(ActionSetsRepository),
            useValue: instance(context.actionSetsRepository),
        };

        const ModuleRefProvider = {
            provide: ModuleRef,
            useValue: instance(context.moduleRefMock),
        };

        const RightsServiceProvider = {
            provide: RightsService,
            useValue: instance(context.rightsServiceMock),
        };

        const QueueProvider = {
            provide: getQueueToken('action'),
            useValue: instance(context.queueMock),
        };

        const app: TestingModule = await Test.createTestingModule({
            providers: [
                ActionSetEntityModelProvider,
                ActionSetsRepositoryProvider,
                ConfigServiceProvider,
                ModuleRefProvider,
                RightsServiceProvider,
                QueueProvider,
                ActionSetsService,
            ],
        }).compile();

        context.actionSetsService = app.get<ActionSetsService>(ActionSetsService);
    });

    describe('getInputHandler', function() {
        it('should recover the input handler', async function() {
            expect(context.actionSetsService.getInputHandler('first')).toBeUndefined();
            context.actionSetsService.setInputHandler('first', {} as any);
            expect(context.actionSetsService.getInputHandler('first')).toBeDefined();
        });

        it('should recover undefined if no handler exists', async function() {
            expect(context.actionSetsService.getInputHandler('first')).toBeUndefined();
        });
    });

    describe('getEventHandler', function() {
        it('should recover the event handler', async function() {
            expect(context.actionSetsService.getEventHandler('first')).toBeUndefined();
            context.actionSetsService.setEventHandler('first', {} as any);
            expect(context.actionSetsService.getEventHandler('first')).toBeDefined();
        });

        it('should recover undefined if no handler exists', async function() {
            expect(context.actionSetsService.getEventHandler('first')).toBeUndefined();
        });
    });

    describe('build', function() {
        it('should build a new action set', async function() {
            const builderMock = mock(AcSetBuilderBaseMock);

            const actionSetName = 'event_create';
            const user = {
                id: 'userid',
            } as UserDto;
            const args = {
                name: 'action name',
            };
            const actionSet: ActionSet = new ActionSet().setId('acset_id');

            when(context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`)).thenResolve(instance(builderMock));
            when(builderMock.buildActionSet(deepEqual(user), deepEqual(args))).thenResolve({
                error: null,
                response: actionSet,
            });

            const spiedService = spy(context.actionSetsService);

            when(spiedService.create(deepEqual(actionSet.raw))).thenResolve({
                error: null,
                response: actionSet.raw,
            });

            when(
                context.rightsServiceMock.addRights(
                    deepEqual(user),
                    deepEqual([
                        {
                            rights: {
                                owner: true,
                            },
                            entity: 'actionset',
                            entityValue: 'acset_id',
                        },
                    ]),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            const res = await context.actionSetsService.build<any>(actionSetName, user, args);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                name: null,
                dispatched_at: res.response.dispatched_at,
                actions: [],
                current_action: 0,
                current_status: null,
                id: 'acset_id',
            });

            verify(context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`)).called();
            verify(builderMock.buildActionSet(deepEqual(user), deepEqual(args))).called();
            verify(spiedService.create(deepEqual(actionSet.raw))).called();
            verify(
                context.rightsServiceMock.addRights(
                    deepEqual(user),
                    deepEqual([
                        {
                            rights: {
                                owner: true,
                            },
                            entity: 'actionset',
                            entityValue: 'acset_id',
                        },
                    ]),
                ),
            ).called();
        });

        it('should fail on builder fetch error', async function() {
            const actionSetName = 'event_create';
            const user = {
                id: 'userid',
            } as UserDto;
            const args = {
                name: 'action name',
            };
            const actionSet: ActionSet = new ActionSet().setId('acset_id');

            when(context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`)).thenReject(
                new Error('unexpected_error'),
            );

            const res = await context.actionSetsService.build<any>(actionSetName, user, args);

            expect(res.error).toEqual('unknown_builder');
            expect(res.response).toEqual(null);

            verify(context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`)).called();
        });

        it('should fail on build error', async function() {
            const builderMock = mock(AcSetBuilderBaseMock);

            const actionSetName = 'event_create';
            const user = {
                id: 'userid',
            } as UserDto;
            const args = {
                name: 'action name',
            };
            const actionSet: ActionSet = new ActionSet().setId('acset_id');

            when(context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`)).thenResolve(instance(builderMock));
            when(builderMock.buildActionSet(deepEqual(user), deepEqual(args))).thenResolve({
                error: 'unexpected_error',
                response: actionSet,
            });

            const res = await context.actionSetsService.build<any>(actionSetName, user, args);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`)).called();
            verify(builderMock.buildActionSet(deepEqual(user), deepEqual(args))).called();
        });

        it('should fail on actionset creation error', async function() {
            const builderMock = mock(AcSetBuilderBaseMock);

            const actionSetName = 'event_create';
            const user = {
                id: 'userid',
            } as UserDto;
            const args = {
                name: 'action name',
            };
            const actionSet: ActionSet = new ActionSet().setId('acset_id');

            when(context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`)).thenResolve(instance(builderMock));
            when(builderMock.buildActionSet(deepEqual(user), deepEqual(args))).thenResolve({
                error: null,
                response: actionSet,
            });

            const spiedService = spy(context.actionSetsService);

            when(spiedService.create(deepEqual(actionSet.raw))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.actionSetsService.build<any>(actionSetName, user, args);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`)).called();
            verify(builderMock.buildActionSet(deepEqual(user), deepEqual(args))).called();
            verify(spiedService.create(deepEqual(actionSet.raw))).called();
        });

        it('should fail on right setter error', async function() {
            const builderMock = mock(AcSetBuilderBaseMock);

            const actionSetName = 'event_create';
            const user = {
                id: 'userid',
            } as UserDto;
            const args = {
                name: 'action name',
            };
            const actionSet: ActionSet = new ActionSet().setId('acset_id');

            when(context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`)).thenResolve(instance(builderMock));
            when(builderMock.buildActionSet(deepEqual(user), deepEqual(args))).thenResolve({
                error: null,
                response: actionSet,
            });

            const spiedService = spy(context.actionSetsService);

            when(spiedService.create(deepEqual(actionSet.raw))).thenResolve({
                error: null,
                response: actionSet.raw,
            });

            when(
                context.rightsServiceMock.addRights(
                    deepEqual(user),
                    deepEqual([
                        {
                            rights: {
                                owner: true,
                            },
                            entity: 'actionset',
                            entityValue: 'acset_id',
                        },
                    ]),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.actionSetsService.build<any>(actionSetName, user, args);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`)).called();
            verify(builderMock.buildActionSet(deepEqual(user), deepEqual(args))).called();
            verify(spiedService.create(deepEqual(actionSet.raw))).called();
            verify(
                context.rightsServiceMock.addRights(
                    deepEqual(user),
                    deepEqual([
                        {
                            rights: {
                                owner: true,
                            },
                            entity: 'actionset',
                            entityValue: 'acset_id',
                        },
                    ]),
                ),
            ).called();
        });
    });
});
