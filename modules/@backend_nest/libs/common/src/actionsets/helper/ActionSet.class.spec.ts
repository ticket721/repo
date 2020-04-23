import { Action } from '@lib/common/actionsets/helper/Action.class';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';

describe('ActionSet', function() {
    it('should load an ActionSetEntity', function() {
        const actions: Action[] = [
            new Action()
                .setType('input')
                .setName('first')
                .setData({ name: 'hello' })
                .setStatus('in progress'),

            new Action()
                .setType('event')
                .setName('second')
                .setData({ name: 'hello' })
                .setStatus('in progress'),
        ];

        const actionSet: ActionSet = new ActionSet()
            .setName('test')
            .setStatus('input:in progress')
            .setId('ccf2ef65-3632-4277-a061-dddfefac48da')
            .setActions(actions);

        expect(actionSet.raw).toEqual({
            name: 'test',
            current_status: 'input:in progress',
            id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
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
                    type: 'event',
                    name: 'second',
                    data: '{"name":"hello"}',
                    status: 'in progress',
                    private: false,
                },
            ],
            current_action: 0,
            dispatched_at: actionSet.raw.dispatched_at,
        });

        const otherActionSet: ActionSet = new ActionSet().load(actionSet.raw);

        expect(otherActionSet.raw).toEqual({
            name: 'test',
            current_status: 'input:in progress',
            id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
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
                    type: 'event',
                    name: 'second',
                    data: '{"name":"hello"}',
                    status: 'in progress',
                    private: false,
                },
            ],
            current_action: 0,
            dispatched_at: actionSet.raw.dispatched_at,
        });
    });

    it('should get and set status field', function() {
        const actions: Action[] = [
            new Action()
                .setType('input')
                .setName('first')
                .setData({ name: 'hello' })
                .setStatus('in progress'),

            new Action()
                .setType('event')
                .setName('second')
                .setData({ name: 'hello' })
                .setStatus('in progress'),
        ];

        const actionSet: ActionSet = new ActionSet()
            .setName('test')
            .setStatus('input:in progress')
            .setId('ccf2ef65-3632-4277-a061-dddfefac48da')
            .setActions(actions);

        expect(actionSet.status).toEqual('input:in progress');
        actionSet.setStatus('input:waiting');
        expect(actionSet.status).toEqual('input:waiting');
    });

    it('should get and set current_action field', function() {
        const actions: Action[] = [
            new Action()
                .setType('input')
                .setName('first')
                .setData({ name: 'hello' })
                .setStatus('in progress'),

            new Action()
                .setType('event')
                .setName('second')
                .setData({ name: 'hello' })
                .setStatus('in progress'),
        ];

        const actionSet: ActionSet = new ActionSet()
            .setName('test')
            .setStatus('input:in progress')
            .setId('ccf2ef65-3632-4277-a061-dddfefac48da')
            .setActions(actions);

        expect(actionSet.current_action).toEqual(0);
        actionSet.setCurrentAction(1);
        expect(actionSet.current_action).toEqual(1);
    });

    it('next should complete action then actionset', function() {
        const actions: Action[] = [
            new Action()
                .setType('input')
                .setName('first')
                .setData({ name: 'hello' })
                .setStatus('in progress'),

            new Action()
                .setType('event')
                .setName('second')
                .setData({ name: 'hello' })
                .setStatus('in progress'),
        ];

        const actionSet: ActionSet = new ActionSet()
            .setName('test')
            .setStatus('input:in progress')
            .setId('ccf2ef65-3632-4277-a061-dddfefac48da')
            .setActions(actions);

        actionSet.next();

        expect(actionSet.actions[0].raw).toEqual({
            error: null,
            type: 'input',
            name: 'first',
            data: '{"name":"hello"}',
            status: 'complete',
            private: false,
        });

        expect(actionSet.action.raw).toEqual({
            error: null,
            type: 'event',
            name: 'second',
            data: '{"name":"hello"}',
            status: 'in progress',
            private: false,
        });

        expect(actionSet.status).toEqual('event:in progress');

        actionSet.next();

        expect(actionSet.actions[1].raw).toEqual({
            error: null,
            type: 'event',
            name: 'second',
            data: '{"name":"hello"}',
            status: 'complete',
            private: false,
        });

        expect(actionSet.action.raw).toEqual({
            error: null,
            type: 'event',
            name: 'second',
            data: '{"name":"hello"}',
            status: 'complete',
            private: false,
        });

        expect(actionSet.status).toEqual('complete');
    });

    it('should get and set actions field', function() {
        const actions: Action[] = [
            new Action()
                .setType('input')
                .setName('first')
                .setData({ name: 'hello' })
                .setStatus('in progress'),

            new Action()
                .setType('event')
                .setName('second')
                .setData({ name: 'hello' })
                .setStatus('in progress'),
        ];

        const actionSet: ActionSet = new ActionSet()
            .setName('test')
            .setStatus('input:in progress')
            .setId('ccf2ef65-3632-4277-a061-dddfefac48da')
            .setActions(actions);

        expect(actionSet.actions).toEqual([
            {
                entity: {
                    error: null,
                    type: 'input',
                    name: 'first',
                    data: '{"name":"hello"}',
                    status: 'in progress',
                    private: false,
                },
            },
            {
                entity: {
                    error: null,
                    type: 'event',
                    name: 'second',
                    data: '{"name":"hello"}',
                    status: 'in progress',
                    private: false,
                },
            },
        ]);
        expect(actionSet.action).toEqual({
            entity: {
                error: null,
                type: 'input',
                name: 'first',
                data: '{"name":"hello"}',
                status: 'in progress',
                private: false,
            },
        });
        actions[0].setName('very first');
        actionSet.setActions(actions);
        expect(actionSet.actions).toEqual([
            {
                entity: {
                    error: null,
                    type: 'input',
                    name: 'very first',
                    data: '{"name":"hello"}',
                    status: 'in progress',
                    private: false,
                },
            },
            {
                entity: {
                    error: null,
                    type: 'event',
                    name: 'second',
                    data: '{"name":"hello"}',
                    status: 'in progress',
                    private: false,
                },
            },
        ]);
    });

    it('should get and set name field', function() {
        const actions: Action[] = [
            new Action()
                .setType('input')
                .setName('first')
                .setData({ name: 'hello' })
                .setStatus('in progress'),

            new Action()
                .setType('event')
                .setName('second')
                .setData({ name: 'hello' })
                .setStatus('in progress'),
        ];

        const actionSet: ActionSet = new ActionSet()
            .setName('test')
            .setStatus('input:in progress')
            .setId('ccf2ef65-3632-4277-a061-dddfefac48da')
            .setActions(actions);

        expect(actionSet.name).toEqual('test');
        actionSet.setName('edited test');
        expect(actionSet.name).toEqual('edited test');
    });

    it('should get and set id field', function() {
        const actions: Action[] = [
            new Action()
                .setType('input')
                .setName('first')
                .setData({ name: 'hello' })
                .setStatus('in progress'),

            new Action()
                .setType('event')
                .setName('second')
                .setData({ name: 'hello' })
                .setStatus('in progress'),
        ];

        const actionSet: ActionSet = new ActionSet()
            .setName('test')
            .setStatus('input:in progress')
            .setId('ccf2ef65-3632-4277-a061-dddfefac48da')
            .setActions(actions);

        expect(actionSet.id).toEqual('ccf2ef65-3632-4277-a061-dddfefac48da');
        actionSet.setId('ccf2ef65-3632-4277-a061-dddfefac48de');
        expect(actionSet.id).toEqual('ccf2ef65-3632-4277-a061-dddfefac48de');
    });

    it('should strip of query for easy update / delete', function() {
        const actions: Action[] = [
            new Action()
                .setType('input')
                .setName('first')
                .setData({ name: 'hello' })
                .setStatus('in progress'),

            new Action()
                .setType('event')
                .setName('second')
                .setData({ name: 'hello' })
                .setStatus('in progress'),
        ];

        const actionSet: ActionSet = new ActionSet()
            .setName('test')
            .setStatus('input:in progress')
            .setId('ccf2ef65-3632-4277-a061-dddfefac48da')
            .setActions(actions);

        expect(actionSet.getQuery()).toEqual({
            id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
        });
        expect(actionSet.withoutQuery()).toEqual({
            name: 'test',
            current_status: 'input:in progress',
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
                    type: 'event',
                    name: 'second',
                    data: '{"name":"hello"}',
                    status: 'in progress',
                    private: false,
                },
            ],
            current_action: 0,
            dispatched_at: actionSet.raw.dispatched_at,
        });
    });

    it('should advance to next action', function() {
        const actions: Action[] = [
            new Action()
                .setType('input')
                .setName('first')
                .setData({ name: 'hello' })
                .setStatus('in progress'),

            new Action()
                .setType('event')
                .setName('second')
                .setData({ name: 'hello' })
                .setStatus('in progress'),
        ];

        const actionSet: ActionSet = new ActionSet()
            .setName('test')
            .setStatus('input:in progress')
            .setId('ccf2ef65-3632-4277-a061-dddfefac48da')
            .setActions(actions);

        actionSet.next();

        expect(actionSet.status).toEqual('event:in progress');
        expect(actionSet.current_action).toEqual(1);

        actionSet.next();

        expect(actionSet.status).toEqual('complete');
        expect(actionSet.current_action).toEqual(1);
    });
});
