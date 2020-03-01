import { ActionSetsTasks } from '@app/worker/tasks/actionsets/ActionSets.tasks';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Job, Queue } from 'bull';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';

class QueueMock {}

const context: {
    actionSetsTasks: ActionSetsTasks;
    actionSetsServiceMock: ActionSetsService;
    actionQueueMock: QueueMock;
    outrospectionServiceMock: OutrospectionService;
    shutdownServiceMock: ShutdownService;
} = {
    actionSetsTasks: null,
    actionSetsServiceMock: null,
    actionQueueMock: null,
    outrospectionServiceMock: null,
    shutdownServiceMock: null,
};

class JobMock {
    constructor(public readonly data: any) {}

    async progress(p: number): Promise<void> {}
}

describe('ActionSets Tasks', function() {
    beforeEach(async function() {
        context.actionSetsServiceMock = mock(ActionSetsService);
        context.actionQueueMock = mock(QueueMock);
        context.outrospectionServiceMock = mock(OutrospectionService);
        context.shutdownServiceMock = mock(ShutdownService);
        context.actionSetsTasks = new ActionSetsTasks(
            instance(context.actionSetsServiceMock),
            new WinstonLoggerService('actionset'),
            (instance(QueueMock) as any) as Queue,
            instance(context.outrospectionServiceMock),
            instance(context.shutdownServiceMock),
        );
    });

    describe('input', function() {
        it('should dispatch inputs', async function() {
            const dispatch = new Date(Date.now());
            const update = new Date(Date.now());
            const create = new Date(Date.now());

            const actionSet: ActionSetEntity = {
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                name: 'test',
                current_status: 'input:in progress',
                owner: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                actions: [
                    {
                        error: null,
                        type: 'input',
                        name: 'first',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                    },
                    {
                        error: null,
                        type: 'event',
                        name: 'second',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                    },
                ],
                current_action: 0,
                dispatched_at: dispatch,
                updated_at: update,
                created_at: create,
            };

            const handler = async (
                entity: ActionSet,
                progress: (p: number) => Promise<void>,
            ): Promise<[ActionSet, boolean]> => {
                return [entity, true];
            };

            const job: Job = new JobMock(actionSet) as Job;

            when(context.actionSetsServiceMock.getInputHandler('first')).thenReturn(handler);
            when(
                context.actionSetsServiceMock.update(
                    deepEqual({
                        id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                    }),
                    deepEqual({
                        name: 'test',
                        current_status: 'input:in progress',
                        owner: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                        actions: [
                            {
                                error: null,
                                type: 'input',
                                name: 'first',
                                data: '{"name":"hello"}',
                                status: 'in progress',
                            },
                            {
                                error: null,
                                type: 'event',
                                name: 'second',
                                data: '{"name":"hello"}',
                                status: 'in progress',
                            },
                        ],
                        current_action: 0,
                        dispatched_at: dispatch,
                        updated_at: update,
                        created_at: create,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {} as any,
            });

            await context.actionSetsTasks.input(job);
            verify(context.actionSetsServiceMock.getInputHandler('first')).twice();
            verify(
                context.actionSetsServiceMock.update(
                    deepEqual({
                        id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                    }),
                    deepEqual({
                        name: 'test',
                        current_status: 'input:in progress',
                        owner: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                        actions: [
                            {
                                error: null,
                                type: 'input',
                                name: 'first',
                                data: '{"name":"hello"}',
                                status: 'in progress',
                            },
                            {
                                error: null,
                                type: 'event',
                                name: 'second',
                                data: '{"name":"hello"}',
                                status: 'in progress',
                            },
                        ],
                        current_action: 0,
                        dispatched_at: dispatch,
                        updated_at: update,
                        created_at: create,
                    }),
                ),
            ).called();
        });

        it('no update required', async function() {
            const dispatch = new Date(Date.now());
            const update = new Date(Date.now());
            const create = new Date(Date.now());

            const actionSet: ActionSetEntity = {
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                name: 'test',
                current_status: 'input:in progress',
                owner: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                actions: [
                    {
                        error: null,
                        type: 'input',
                        name: 'first',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                    },
                    {
                        error: null,
                        type: 'event',
                        name: 'second',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                    },
                ],
                current_action: 0,
                dispatched_at: dispatch,
                updated_at: update,
                created_at: create,
            };

            const handler = async (
                entity: ActionSet,
                progress: (p: number) => Promise<void>,
            ): Promise<[ActionSet, boolean]> => {
                return [entity, false];
            };

            const job: Job = new JobMock(actionSet) as Job;

            when(context.actionSetsServiceMock.getInputHandler('first')).thenReturn(handler);

            await context.actionSetsTasks.input(job);
            verify(context.actionSetsServiceMock.getInputHandler('first')).twice();
            verify(
                context.actionSetsServiceMock.update(
                    deepEqual({
                        id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                    }),
                    deepEqual({
                        name: 'test',
                        current_status: 'input:in progress',
                        owner: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                        actions: [
                            {
                                error: null,
                                type: 'input',
                                name: 'first',
                                data: '{"name":"hello"}',
                                status: 'in progress',
                            },
                            {
                                error: null,
                                type: 'event',
                                name: 'second',
                                data: '{"name":"hello"}',
                                status: 'in progress',
                            },
                        ],
                        current_action: 0,
                        dispatched_at: dispatch,
                        updated_at: update,
                        created_at: create,
                    }),
                ),
            ).never();
        });

        it('no handler found', async function() {
            const dispatch = new Date(Date.now());
            const update = new Date(Date.now());
            const create = new Date(Date.now());

            const actionSet: ActionSetEntity = {
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                name: 'test',
                current_status: 'input:in progress',
                owner: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                actions: [
                    {
                        error: null,
                        type: 'input',
                        name: 'first',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                    },
                    {
                        error: null,
                        type: 'event',
                        name: 'second',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                    },
                ],
                current_action: 0,
                dispatched_at: dispatch,
                updated_at: update,
                created_at: create,
            };

            const job: Job = new JobMock(actionSet) as Job;

            when(context.actionSetsServiceMock.getInputHandler('first')).thenReturn(undefined);

            await expect(context.actionSetsTasks.input(job)).rejects.toEqual(
                new Error(`Cannot find input handler for action first in actionset ${actionSet.id}`),
            );

            verify(context.actionSetsServiceMock.getInputHandler('first')).called();
            verify(
                context.actionSetsServiceMock.update(
                    deepEqual({
                        id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                    }),
                    deepEqual({
                        name: 'test',
                        current_status: 'input:in progress',
                        owner: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                        actions: [
                            {
                                error: null,
                                type: 'input',
                                name: 'first',
                                data: '{"name":"hello"}',
                                status: 'in progress',
                            },
                            {
                                error: null,
                                type: 'event',
                                name: 'second',
                                data: '{"name":"hello"}',
                                status: 'in progress',
                            },
                        ],
                        current_action: 0,
                        dispatched_at: dispatch,
                        updated_at: update,
                        created_at: create,
                    }),
                ),
            ).never();
        });
    });
});
