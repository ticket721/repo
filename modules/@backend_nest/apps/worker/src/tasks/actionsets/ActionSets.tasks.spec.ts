import { ActionSetsTasks } from '@app/worker/tasks/actionsets/ActionSets.tasks';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { anything, capture, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Job, Queue } from 'bull';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
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
                links: [],
                actions: [
                    {
                        error: null,
                        type: 'input',
                        name: 'first',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                        private: false,
                    },
                    {
                        error: null,
                        type: 'input',
                        name: 'second',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                        private: false,
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
                entity.next();
                return [entity, true];
            };

            const job: Job = new JobMock(actionSet) as Job;

            when(context.actionSetsServiceMock.getInputHandler('first')).thenReturn(handler);
            when(context.actionSetsServiceMock.getInputHandler('second')).thenReturn(handler);
            when(context.actionSetsServiceMock.onComplete(anything())).thenResolve({
                error: null,
                response: null,
            });

            await context.actionSetsTasks.input(job);

            verify(context.actionSetsServiceMock.getInputHandler('first')).twice();
            verify(context.actionSetsServiceMock.getInputHandler('second')).twice();
            verify(context.actionSetsServiceMock.update(anything(), anything())).twice();
            verify(context.actionSetsServiceMock.onComplete(anything())).called();
        });

        it('should dispatch inputs and set status to error', async function() {
            const dispatch = new Date(Date.now());
            const update = new Date(Date.now());
            const create = new Date(Date.now());

            const actionSet: ActionSetEntity = {
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                name: 'test',
                current_status: 'input:in progress',
                links: [],
                actions: [
                    {
                        error: null,
                        type: 'input',
                        name: 'first',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                        private: false,
                    },
                    {
                        error: null,
                        type: 'input',
                        name: 'second',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                        private: false,
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
                entity.setStatus('error');
                entity.action.setError({});
                return [entity, true];
            };

            const job: Job = new JobMock(actionSet) as Job;

            when(context.actionSetsServiceMock.getInputHandler('first')).thenReturn(handler);

            await context.actionSetsTasks.input(job);

            verify(context.actionSetsServiceMock.getInputHandler('first')).twice();
            verify(context.actionSetsServiceMock.update(anything(), anything())).once();
        });


        it('should not update', async function() {
            const dispatch = new Date(Date.now());
            const update = new Date(Date.now());
            const create = new Date(Date.now());

            const actionSet: ActionSetEntity = {
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                name: 'test',
                current_status: 'input:in progress',
                links: [],
                actions: [
                    {
                        error: null,
                        type: 'input',
                        name: 'first',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                        private: false,
                    },
                    {
                        error: null,
                        type: 'input',
                        name: 'second',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                        private: false,
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
                entity.next();
                return [entity, false];
            };

            const job: Job = new JobMock(actionSet) as Job;

            when(context.actionSetsServiceMock.getInputHandler('first')).thenReturn(handler);
            when(context.actionSetsServiceMock.getInputHandler('second')).thenReturn(handler);
            when(context.actionSetsServiceMock.onComplete(anything())).thenResolve({
                error: null,
                response: null,
            });

            await context.actionSetsTasks.input(job);

            verify(context.actionSetsServiceMock.getInputHandler('first')).twice();
            verify(context.actionSetsServiceMock.getInputHandler('second')).twice();
            verify(context.actionSetsServiceMock.update(anything(), anything())).never();
            verify(context.actionSetsServiceMock.onComplete(anything())).called();
        });

        it('should fail on input fetch error', async function() {
            const dispatch = new Date(Date.now());
            const update = new Date(Date.now());
            const create = new Date(Date.now());

            const actionSet: ActionSetEntity = {
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                name: 'test',
                current_status: 'input:in progress',
                links: [],
                actions: [
                    {
                        error: null,
                        type: 'input',
                        name: 'first',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                        private: false,
                    },
                    {
                        error: null,
                        type: 'input',
                        name: 'second',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                        private: false,
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
                entity.next();
                return [entity, true];
            };

            const job: Job = new JobMock(actionSet) as Job;

            when(context.actionSetsServiceMock.getInputHandler('first')).thenReturn(undefined);

            await expect(context.actionSetsTasks.input(job)).rejects.toMatchObject(
                new Error(`Cannot find input handler for action first in actionset ${actionSet.id}`),
            );

            verify(context.actionSetsServiceMock.getInputHandler('first')).called();
        });

        it('should fail on complete lifecycle callback', async function() {
            const dispatch = new Date(Date.now());
            const update = new Date(Date.now());
            const create = new Date(Date.now());

            const actionSet: ActionSetEntity = {
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                name: 'test',
                current_status: 'input:in progress',
                links: [],
                actions: [
                    {
                        error: null,
                        type: 'input',
                        name: 'first',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                        private: false,
                    },
                    {
                        error: null,
                        type: 'input',
                        name: 'second',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                        private: false,
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
                entity.next();
                return [entity, true];
            };

            const job: Job = new JobMock(actionSet) as Job;

            when(context.actionSetsServiceMock.getInputHandler('first')).thenReturn(handler);
            when(context.actionSetsServiceMock.getInputHandler('second')).thenReturn(handler);
            when(context.actionSetsServiceMock.onComplete(anything())).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(context.actionSetsTasks.input(job)).rejects.toMatchObject(new Error(`Error while running onComplete actionset lifecycle: unexpected_error`));

        });

    });

    describe('input', function() {
        it('should dispatch events', async function() {
            const dispatch = new Date(Date.now());
            const update = new Date(Date.now());
            const create = new Date(Date.now());

            const actionSet: ActionSetEntity = {
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                name: 'test',
                current_status: 'input:in progress',
                links: [],
                actions: [
                    {
                        error: null,
                        type: 'event',
                        name: 'first',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                        private: false,
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
                entity.next();
                return [entity, true];
            };

            const job: Job = new JobMock(actionSet) as Job;

            when(context.actionSetsServiceMock.getEventHandler('first')).thenReturn(handler);
            when(context.actionSetsServiceMock.onComplete(anything())).thenResolve({
                error: null,
                response: null,
            });

            await context.actionSetsTasks.event(job);

            verify(context.actionSetsServiceMock.getEventHandler('first')).twice();
            verify(context.actionSetsServiceMock.update(anything(), anything())).once();
            verify(context.actionSetsServiceMock.onComplete(anything())).called();
        });

        it('should dispatch events but no updates', async function() {
            const dispatch = new Date(Date.now());
            const update = new Date(Date.now());
            const create = new Date(Date.now());

            const actionSet: ActionSetEntity = {
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                name: 'test',
                current_status: 'input:in progress',
                links: [],
                actions: [
                    {
                        error: null,
                        type: 'event',
                        name: 'first',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                        private: false,
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
                entity.next();
                return [entity, false];
            };

            const job: Job = new JobMock(actionSet) as Job;

            when(context.actionSetsServiceMock.getEventHandler('first')).thenReturn(handler);
            when(context.actionSetsServiceMock.onComplete(anything())).thenResolve({
                error: null,
                response: null,
            });

            await context.actionSetsTasks.event(job);

            verify(context.actionSetsServiceMock.getEventHandler('first')).twice();
            verify(context.actionSetsServiceMock.update(anything(), anything())).never();
            verify(context.actionSetsServiceMock.onComplete(anything())).called();
        });

        it('should fail on handler not found', async function() {
            const dispatch = new Date(Date.now());
            const update = new Date(Date.now());
            const create = new Date(Date.now());

            const actionSet: ActionSetEntity = {
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
                name: 'test',
                current_status: 'input:in progress',
                links: [],
                actions: [
                    {
                        error: null,
                        type: 'event',
                        name: 'first',
                        data: '{"name":"hello"}',
                        status: 'in progress',
                        private: false,
                    },
                ],
                current_action: 0,
                dispatched_at: dispatch,
                updated_at: update,
                created_at: create,
            };

            const job: Job = new JobMock(actionSet) as Job;

            when(context.actionSetsServiceMock.getEventHandler('first')).thenReturn(undefined);

            await expect(context.actionSetsTasks.event(job)).rejects.toMatchObject(
                new Error(`Cannot find event handler for action first in actionset ${actionSet.id}`),
            );

            verify(context.actionSetsServiceMock.getEventHandler('first')).once();
            verify(context.actionSetsServiceMock.update(anything(), anything())).never();
        });
    });
});
