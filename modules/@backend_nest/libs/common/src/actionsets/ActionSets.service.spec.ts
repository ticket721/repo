import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { ActionSetsRepository } from '@lib/common/actionsets/ActionSets.repository';
import { anyString, anything, capture, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { getModelToken, getRepositoryToken } from '@iaminfinity/express-cassandra/dist/utils/cassandra-orm.utils';
import {
    ActionEntity,
    ActionSetEntity,
    ActionSetStatus,
    ActionStatus,
    ActionType,
} from '@lib/common/actionsets/entities/ActionSet.entity';
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
import { NestError } from '@lib/common/utils/NestError';

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
    isPrivate = false;

    buildActionSet(caller: UserDto, args: any): Promise<ServiceResponse<ActionSet>> {
        return null;
    }
}

const getAcsetBuilderMock = (privateMode: boolean = false): AcSetBuilderBaseMock => {
    const builder = mock(AcSetBuilderBaseMock);
    when(builder.isPrivate).thenReturn(privateMode);
    return builder;
};

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
            const builderMock = getAcsetBuilderMock();

            const actionSetName = 'event_create';
            const user = {
                id: 'userid',
            } as UserDto;
            const args = {
                name: 'action name',
            };
            const actionSet: ActionSet = new ActionSet().setId('acset_id');

            when(
                context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`, deepEqual({ strict: false })),
            ).thenResolve(instance(builderMock));
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
                consumed: false,
                dispatched_at: res.response.dispatched_at,
                actions: [],
                current_action: 0,
                current_status: null,
                id: 'acset_id',
            });

            verify(
                context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`, deepEqual({ strict: false })),
            ).called();
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

            when(
                context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`, deepEqual({ strict: false })),
            ).thenReject(new NestError('unexpected_error'));

            const res = await context.actionSetsService.build<any>(actionSetName, user, args);

            expect(res.error).toEqual('unknown_builder');
            expect(res.response).toEqual(null);

            verify(
                context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`, deepEqual({ strict: false })),
            ).called();
        });

        it('should fail on build error', async function() {
            const builderMock = getAcsetBuilderMock();

            const actionSetName = 'event_create';
            const user = {
                id: 'userid',
            } as UserDto;
            const args = {
                name: 'action name',
            };
            const actionSet: ActionSet = new ActionSet().setId('acset_id');

            when(
                context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`, deepEqual({ strict: false })),
            ).thenResolve(instance(builderMock));
            when(builderMock.buildActionSet(deepEqual(user), deepEqual(args))).thenResolve({
                error: 'unexpected_error',
                response: actionSet,
            });

            const res = await context.actionSetsService.build<any>(actionSetName, user, args);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`, deepEqual({ strict: false })),
            ).called();
            verify(builderMock.buildActionSet(deepEqual(user), deepEqual(args))).called();
        });

        it('should fail on actionset creation error', async function() {
            const builderMock = getAcsetBuilderMock();

            const actionSetName = 'event_create';
            const user = {
                id: 'userid',
            } as UserDto;
            const args = {
                name: 'action name',
            };
            const actionSet: ActionSet = new ActionSet().setId('acset_id');

            when(
                context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`, deepEqual({ strict: false })),
            ).thenResolve(instance(builderMock));
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

            verify(
                context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`, deepEqual({ strict: false })),
            ).called();
            verify(builderMock.buildActionSet(deepEqual(user), deepEqual(args))).called();
            verify(spiedService.create(deepEqual(actionSet.raw))).called();
        });

        it('should fail on right setter error', async function() {
            const builderMock = getAcsetBuilderMock();

            const actionSetName = 'event_create';
            const user = {
                id: 'userid',
            } as UserDto;
            const args = {
                name: 'action name',
            };
            const actionSet: ActionSet = new ActionSet().setId('acset_id');

            when(
                context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`, deepEqual({ strict: false })),
            ).thenResolve(instance(builderMock));
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

            verify(
                context.moduleRefMock.get(`ACTION_SET_BUILDER/${actionSetName}`, deepEqual({ strict: false })),
            ).called();
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

    describe('errorStep', function() {
        it('should set step in error mode', async function() {
            const actionSetId = '00000000-0000-0000-0000-000000000000';

            const actionSetEntity: ActionSetEntity = {
                id: actionSetId,
                consumed: false,
                actions: [
                    {
                        status: 'waiting',
                        name: 'test',
                        data: null,
                        type: 'input',
                        error: null,
                        private: false,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: 'test',
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
                dispatched_at: new Date(Date.now()),
            };

            const spiedService = spy(context.actionSetsService);

            const error = 'an_error_occured';
            const details = { error: 'happens' };

            when(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [actionSetEntity],
            });

            when(
                spiedService.update(
                    deepEqual({
                        id: actionSetId,
                    }),
                    deepEqual({
                        actions: [
                            {
                                status: 'error',
                                name: 'test',
                                data: null,
                                type: 'input',
                                error: anyString(),
                                private: false,
                            },
                        ],
                        links: [],
                        consumed: false,
                        current_action: 0,
                        current_status: 'input:error',
                        name: 'test',
                        created_at: anything(),
                        updated_at: anything(),
                        dispatched_at: anything(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    id: actionSetId,
                    consumed: false,
                    actions: [
                        {
                            status: 'error',
                            name: 'test',
                            data: null,
                            type: 'input',
                            error: '{"details":{"error":"happens"},"error":"an_error_occured"}',
                            private: false,
                        },
                    ],
                    links: [],
                    current_action: 0,
                    current_status: 'input:error',
                    name: 'test',
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                    dispatched_at: new Date(Date.now()),
                },
            });

            const res = await context.actionSetsService.errorStep(actionSetId, error, details, 0);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                id: actionSetId,
                actions: [
                    {
                        status: 'error',
                        name: 'test',
                        data: null,
                        type: 'input',
                        error: '{"details":{"error":"happens"},"error":"an_error_occured"}',
                        private: false,
                    },
                ],
                links: [],
                consumed: false,
                current_action: 0,
                current_status: 'input:error',
                name: 'test',
                created_at: res.response.created_at,
                updated_at: res.response.updated_at,
                dispatched_at: res.response.dispatched_at,
            });

            verify(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();

            verify(
                spiedService.update(
                    deepEqual({
                        id: actionSetId,
                    }),
                    deepEqual({
                        actions: [
                            {
                                status: 'error',
                                name: 'test',
                                data: null,
                                type: 'input',
                                error: anyString(),
                                private: false,
                            },
                        ],
                        links: [],
                        consumed: false,
                        current_action: 0,
                        current_status: 'input:error',
                        name: 'test',
                        created_at: anything(),
                        updated_at: anything(),
                        dispatched_at: anything(),
                    }),
                ),
            ).called();
        });

        it('should fail on fetch error', async function() {
            const actionSetId = '00000000-0000-0000-0000-000000000000';

            const actionSetEntity: ActionSetEntity = {
                id: actionSetId,
                consumed: false,
                actions: [
                    {
                        status: 'waiting',
                        name: 'test',
                        data: null,
                        type: 'input',
                        error: null,
                        private: false,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: 'test',
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
                dispatched_at: new Date(Date.now()),
            };

            const spiedService = spy(context.actionSetsService);

            const error = 'an_error_occured';
            const details = { error: 'happens' };

            when(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.actionSetsService.errorStep(actionSetId, error, details, 0);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();
        });

        it('should fail on empty fetch', async function() {
            const actionSetId = '00000000-0000-0000-0000-000000000000';

            const actionSetEntity: ActionSetEntity = {
                id: actionSetId,
                consumed: false,
                actions: [
                    {
                        status: 'waiting',
                        name: 'test',
                        data: null,
                        type: 'input',
                        error: null,
                        private: false,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: 'test',
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
                dispatched_at: new Date(Date.now()),
            };

            const spiedService = spy(context.actionSetsService);

            const error = 'an_error_occured';
            const details = { error: 'happens' };

            when(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            const res = await context.actionSetsService.errorStep(actionSetId, error, details, 0);

            expect(res.error).toEqual('actionset_not_found');
            expect(res.response).toEqual(null);

            verify(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();
        });

        it('should fail on update error', async function() {
            const actionSetId = '00000000-0000-0000-0000-000000000000';

            const actionSetEntity: ActionSetEntity = {
                id: actionSetId,
                consumed: false,
                actions: [
                    {
                        status: 'waiting',
                        name: 'test',
                        data: null,
                        type: 'input',
                        error: null,
                        private: false,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: 'test',
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
                dispatched_at: new Date(Date.now()),
            };

            const spiedService = spy(context.actionSetsService);

            const error = 'an_error_occured';
            const details = { error: 'happens' };

            when(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [actionSetEntity],
            });

            when(
                spiedService.update(
                    deepEqual({
                        id: actionSetId,
                    }),
                    deepEqual({
                        actions: [
                            {
                                status: 'error',
                                name: 'test',
                                data: null,
                                type: 'input',
                                error: anyString(),
                                private: false,
                            },
                        ],
                        links: [],
                        consumed: false,
                        current_action: 0,
                        current_status: 'input:error',
                        name: 'test',
                        created_at: anything(),
                        updated_at: anything(),
                        dispatched_at: anything(),
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.actionSetsService.errorStep(actionSetId, error, details, 0);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();

            verify(
                spiedService.update(
                    deepEqual({
                        id: actionSetId,
                    }),
                    deepEqual({
                        actions: [
                            {
                                status: 'error',
                                name: 'test',
                                data: null,
                                type: 'input',
                                error: anyString(),
                                private: false,
                            },
                        ],
                        links: [],
                        consumed: false,
                        current_action: 0,
                        current_status: 'input:error',
                        name: 'test',
                        created_at: anything(),
                        updated_at: anything(),
                        dispatched_at: anything(),
                    }),
                ),
            ).called();
        });
    });

    describe('updateAction', function() {
        it('should update the action', async function() {
            const actionSetId = '00000000-0000-0000-0000-000000000000';

            const actionSetEntity: ActionSetEntity = {
                id: actionSetId,
                consumed: false,
                actions: [
                    {
                        status: 'waiting',
                        name: 'test',
                        data: null,
                        type: 'input',
                        error: null,
                        private: false,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: 'test',
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
                dispatched_at: new Date(Date.now()),
            };

            const spiedService = spy(context.actionSetsService);

            const data = { field: 'value' };
            const idx = 0;

            when(
                spiedService.update(
                    deepEqual({
                        id: actionSetId,
                    }),
                    deepEqual({
                        actions: [
                            {
                                status: 'waiting',
                                name: 'test',
                                data: JSON.stringify(data),
                                type: 'input',
                                error: null,
                                private: false,
                            },
                        ],
                        links: [],
                        consumed: false,
                        current_action: 0,
                        current_status: 'input:waiting',
                        name: 'test',
                        created_at: anything(),
                        updated_at: anything(),
                        dispatched_at: anything(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            let callIdx = 1;

            when(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenCall(() => {
                if (callIdx === 0) {
                    callIdx += 1;
                    return Promise.resolve({
                        error: null,
                        response: [actionSetEntity],
                    });
                } else {
                    return Promise.resolve({
                        error: null,
                        response: [
                            {
                                id: actionSetId,
                                consumed: false,
                                actions: [
                                    {
                                        status: 'waiting',
                                        name: 'test',
                                        data: JSON.stringify(data),
                                        type: 'input',
                                        error: null,
                                        private: false,
                                    },
                                ],
                                links: [],
                                current_action: 0,
                                current_status: 'input:waiting',
                                name: 'test',
                                created_at: new Date(Date.now()),
                                updated_at: new Date(Date.now()),
                                dispatched_at: new Date(Date.now()),
                            },
                        ],
                    });
                }
            });

            const res = await context.actionSetsService.updateAction(new ActionSet().load(actionSetEntity), idx, data);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                id: actionSetId,
                actions: [
                    {
                        status: 'waiting',
                        name: 'test',
                        data: JSON.stringify(data),
                        type: 'input',
                        error: null,
                        private: false,
                    },
                ],
                links: [],
                consumed: false,
                current_action: 0,
                current_status: 'input:waiting',
                name: 'test',
                created_at: res.response.created_at,
                updated_at: res.response.updated_at,
                dispatched_at: res.response.dispatched_at,
            });

            verify(
                spiedService.update(
                    deepEqual({
                        id: actionSetId,
                    }),
                    deepEqual({
                        actions: [
                            {
                                status: 'waiting',
                                name: 'test',
                                data: JSON.stringify(data),
                                type: 'input',
                                error: null,
                                private: false,
                            },
                        ],
                        links: [],
                        current_action: 0,
                        consumed: false,
                        current_status: 'input:waiting',
                        name: 'test',
                        created_at: anything(),
                        updated_at: anything(),
                        dispatched_at: anything(),
                    }),
                ),
            ).called();

            verify(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();

            verify(context.queueMock.add('input', deepEqual(actionSetEntity))).called();
        });

        it('should update the action without provided entity', async function() {
            const actionSetId = '00000000-0000-0000-0000-000000000000';

            const actionSetEntity: ActionSetEntity = {
                id: actionSetId,
                consumed: false,
                actions: [
                    {
                        status: 'waiting',
                        name: 'test',
                        data: null,
                        type: 'input',
                        error: null,
                        private: false,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: 'test',
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
                dispatched_at: new Date(Date.now()),
            };

            const spiedService = spy(context.actionSetsService);

            const data = { field: 'value' };
            const idx = 0;

            when(
                spiedService.update(
                    deepEqual({
                        id: actionSetId,
                    }),
                    deepEqual({
                        actions: [
                            {
                                status: 'waiting',
                                name: 'test',
                                data: JSON.stringify(data),
                                type: 'input',
                                error: null,
                                private: false,
                            },
                        ],
                        consumed: false,
                        links: [],
                        current_action: 0,
                        current_status: 'input:waiting',
                        name: 'test',
                        created_at: anything(),
                        updated_at: anything(),
                        dispatched_at: anything(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            let callIdx = 0;

            when(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenCall(() => {
                if (callIdx === 0) {
                    callIdx += 1;
                    return Promise.resolve({
                        error: null,
                        response: [actionSetEntity],
                    });
                } else {
                    return Promise.resolve({
                        error: null,
                        response: [
                            {
                                id: actionSetId,
                                consumed: false,
                                actions: [
                                    {
                                        status: 'waiting',
                                        name: 'test',
                                        data: JSON.stringify(data),
                                        type: 'input',
                                        error: null,
                                        private: false,
                                    },
                                ],
                                links: [],
                                current_action: 0,
                                current_status: 'input:waiting',
                                name: 'test',
                                created_at: new Date(Date.now()),
                                updated_at: new Date(Date.now()),
                                dispatched_at: new Date(Date.now()),
                            },
                        ],
                    });
                }
            });

            const res = await context.actionSetsService.updateAction(actionSetId, idx, data);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                id: actionSetId,
                actions: [
                    {
                        status: 'waiting',
                        name: 'test',
                        data: JSON.stringify(data),
                        type: 'input',
                        error: null,
                        private: false,
                    },
                ],
                links: [],
                consumed: false,
                current_action: 0,
                current_status: 'input:waiting',
                name: 'test',
                created_at: res.response.created_at,
                updated_at: res.response.updated_at,
                dispatched_at: res.response.dispatched_at,
            });

            verify(
                spiedService.update(
                    deepEqual({
                        id: actionSetId,
                    }),
                    deepEqual({
                        actions: [
                            {
                                status: 'waiting',
                                name: 'test',
                                data: JSON.stringify(data),
                                type: 'input',
                                error: null,
                                private: false,
                            },
                        ],
                        links: [],
                        consumed: false,
                        current_action: 0,
                        current_status: 'input:waiting',
                        name: 'test',
                        created_at: anything(),
                        updated_at: anything(),
                        dispatched_at: anything(),
                    }),
                ),
            ).called();

            verify(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).twice();

            verify(context.queueMock.add('input', deepEqual(actionSetEntity))).called();
        });

        it('should fail on initial fetch error', async function() {
            const actionSetId = '00000000-0000-0000-0000-000000000000';

            const actionSetEntity: ActionSetEntity = {
                id: actionSetId,
                consumed: false,
                actions: [
                    {
                        status: 'waiting',
                        name: 'test',
                        data: null,
                        type: 'input',
                        error: null,
                        private: false,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: 'test',
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
                dispatched_at: new Date(Date.now()),
            };

            const spiedService = spy(context.actionSetsService);

            const data = { field: 'value' };
            const idx = 0;

            when(
                spiedService.update(
                    deepEqual({
                        id: actionSetId,
                    }),
                    deepEqual({
                        actions: [
                            {
                                status: 'waiting',
                                name: 'test',
                                data: JSON.stringify(data),
                                type: 'input',
                                error: null,
                                private: false,
                            },
                        ],
                        links: [],
                        current_action: 0,
                        current_status: 'input:waiting',
                        name: 'test',
                        created_at: anything(),
                        updated_at: anything(),
                        dispatched_at: anything(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            let callIdx = 0;

            when(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenCall(() => {
                if (callIdx === 0) {
                    callIdx += 1;
                    return Promise.resolve({
                        error: 'unexpected_error',
                        response: null,
                    });
                } else {
                    return Promise.resolve({
                        error: null,
                        response: [
                            {
                                id: actionSetId,
                                actions: [
                                    {
                                        status: 'waiting',
                                        name: 'test',
                                        data: JSON.stringify(data),
                                        type: 'input',
                                        error: null,
                                        private: false,
                                    },
                                ],
                                links: [],
                                current_action: 0,
                                current_status: 'input:waiting',
                                name: 'test',
                                created_at: new Date(Date.now()),
                                updated_at: new Date(Date.now()),
                                dispatched_at: new Date(Date.now()),
                            },
                        ],
                    });
                }
            });

            const res = await context.actionSetsService.updateAction(actionSetId, idx, data);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();
        });

        it('should fail on initial empty fetch', async function() {
            const actionSetId = '00000000-0000-0000-0000-000000000000';

            const actionSetEntity: ActionSetEntity = {
                id: actionSetId,
                consumed: false,
                actions: [
                    {
                        status: 'waiting',
                        name: 'test',
                        data: null,
                        type: 'input',
                        error: null,
                        private: false,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: 'test',
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
                dispatched_at: new Date(Date.now()),
            };

            const spiedService = spy(context.actionSetsService);

            const data = { field: 'value' };
            const idx = 0;

            when(
                spiedService.update(
                    deepEqual({
                        id: actionSetId,
                    }),
                    deepEqual({
                        actions: [
                            {
                                status: 'waiting',
                                name: 'test',
                                data: JSON.stringify(data),
                                type: 'input',
                                error: null,
                                private: false,
                            },
                        ],
                        links: [],
                        current_action: 0,
                        current_status: 'input:waiting',
                        name: 'test',
                        created_at: anything(),
                        updated_at: anything(),
                        dispatched_at: anything(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            let callIdx = 0;

            when(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenCall(() => {
                if (callIdx === 0) {
                    callIdx += 1;
                    return Promise.resolve({
                        error: null,
                        response: [],
                    });
                } else {
                    return Promise.resolve({
                        error: null,
                        response: [
                            {
                                id: actionSetId,
                                actions: [
                                    {
                                        status: 'waiting',
                                        name: 'test',
                                        data: JSON.stringify(data),
                                        type: 'input',
                                        error: null,
                                        private: false,
                                    },
                                ],
                                links: [],
                                current_action: 0,
                                current_status: 'input:waiting',
                                name: 'test',
                                created_at: new Date(Date.now()),
                                updated_at: new Date(Date.now()),
                                dispatched_at: new Date(Date.now()),
                            },
                        ],
                    });
                }
            });

            const res = await context.actionSetsService.updateAction(actionSetId, idx, data);

            expect(res.error).toEqual('actionset_not_found');
            expect(res.response).toEqual(null);

            verify(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();
        });

        it('should fail on update error', async function() {
            const actionSetId = '00000000-0000-0000-0000-000000000000';

            const actionSetEntity: ActionSetEntity = {
                id: actionSetId,
                consumed: false,
                actions: [
                    {
                        status: 'waiting',
                        name: 'test',
                        data: null,
                        type: 'input',
                        error: null,
                        private: false,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: 'test',
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
                dispatched_at: new Date(Date.now()),
            };

            const spiedService = spy(context.actionSetsService);

            const data = { field: 'value' };
            const idx = 0;

            when(
                spiedService.update(
                    deepEqual({
                        id: actionSetId,
                    }),
                    deepEqual({
                        actions: [
                            {
                                status: 'waiting',
                                name: 'test',
                                data: JSON.stringify(data),
                                type: 'input',
                                error: null,
                                private: false,
                            },
                        ],
                        links: [],
                        consumed: false,
                        current_action: 0,
                        current_status: 'input:waiting',
                        name: 'test',
                        created_at: anything(),
                        updated_at: anything(),
                        dispatched_at: anything(),
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            let callIdx = 0;

            when(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenCall(() => {
                if (callIdx === 0) {
                    callIdx += 1;
                    return Promise.resolve({
                        error: null,
                        response: [actionSetEntity],
                    });
                } else {
                    return Promise.resolve({
                        error: null,
                        response: [
                            {
                                id: actionSetId,
                                consumed: false,
                                actions: [
                                    {
                                        status: 'waiting',
                                        name: 'test',
                                        data: JSON.stringify(data),
                                        type: 'input',
                                        error: null,
                                        private: false,
                                    },
                                ],
                                links: [],
                                current_action: 0,
                                current_status: 'input:waiting',
                                name: 'test',
                                created_at: new Date(Date.now()),
                                updated_at: new Date(Date.now()),
                                dispatched_at: new Date(Date.now()),
                            },
                        ],
                    });
                }
            });

            const res = await context.actionSetsService.updateAction(actionSetId, idx, data);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                spiedService.update(
                    deepEqual({
                        id: actionSetId,
                    }),
                    deepEqual({
                        actions: [
                            {
                                status: 'waiting',
                                name: 'test',
                                data: JSON.stringify(data),
                                type: 'input',
                                error: null,
                                private: false,
                            },
                        ],
                        links: [],
                        consumed: false,
                        current_action: 0,
                        current_status: 'input:waiting',
                        name: 'test',
                        created_at: anything(),
                        updated_at: anything(),
                        dispatched_at: anything(),
                    }),
                ),
            ).called();

            verify(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).called();
        });

        it('should fail on second fetch error', async function() {
            const actionSetId = '00000000-0000-0000-0000-000000000000';

            const actionSetEntity: ActionSetEntity = {
                id: actionSetId,
                consumed: false,
                actions: [
                    {
                        status: 'waiting',
                        name: 'test',
                        data: null,
                        type: 'input',
                        error: null,
                        private: false,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: 'test',
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
                dispatched_at: new Date(Date.now()),
            };

            const spiedService = spy(context.actionSetsService);

            const data = { field: 'value' };
            const idx = 0;

            when(
                spiedService.update(
                    deepEqual({
                        id: actionSetId,
                    }),
                    deepEqual({
                        actions: [
                            {
                                status: 'waiting',
                                name: 'test',
                                data: JSON.stringify(data),
                                type: 'input',
                                error: null,
                                private: false,
                            },
                        ],
                        consumed: false,
                        links: [],
                        current_action: 0,
                        current_status: 'input:waiting',
                        name: 'test',
                        created_at: anything(),
                        updated_at: anything(),
                        dispatched_at: anything(),
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            let callIdx = 0;

            when(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).thenCall(() => {
                if (callIdx === 0) {
                    callIdx += 1;
                    return Promise.resolve({
                        error: null,
                        response: [actionSetEntity],
                    });
                } else {
                    return Promise.resolve({
                        error: 'unexpected_error',
                        response: null,
                    });
                }
            });

            const res = await context.actionSetsService.updateAction(actionSetId, idx, data);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                spiedService.update(
                    deepEqual({
                        id: actionSetId,
                    }),
                    deepEqual({
                        actions: [
                            {
                                status: 'waiting',
                                name: 'test',
                                data: JSON.stringify(data),
                                type: 'input',
                                error: null,
                                private: false,
                            },
                        ],
                        links: [],
                        consumed: false,
                        current_action: 0,
                        current_status: 'input:waiting',
                        name: 'test',
                        created_at: anything(),
                        updated_at: anything(),
                        dispatched_at: anything(),
                    }),
                ),
            ).called();

            verify(
                spiedService.search(
                    deepEqual({
                        id: actionSetId,
                    }),
                ),
            ).twice();
        });
    });
});
