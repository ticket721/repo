import { Action } from '@lib/common/actionsets/helper/Action';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet';
import { UserDto } from '@lib/common/users/dto/User.dto';

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
            .setOwner({
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
            } as UserDto)
            .setActions(actions);

        expect(actionSet.raw).toEqual({
            name: 'test',
            current_status: 'input:in progress',
            id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
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
            dispatched_at: actionSet.raw.dispatched_at,
        });

        const otherActionSet: ActionSet = new ActionSet().load(actionSet.raw);

        expect(otherActionSet.raw).toEqual({
            name: 'test',
            current_status: 'input:in progress',
            id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
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
            .setOwner({
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
            } as UserDto)
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
            .setOwner({
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
            } as UserDto)
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
            .setOwner({
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
            } as UserDto)
            .setActions(actions);

        actionSet.next();

        expect(actionSet.actions[0].raw).toEqual({
            error: null,
            type: 'input',
            name: 'first',
            data: '{"name":"hello"}',
            status: 'complete',
        });

        expect(actionSet.action.raw).toEqual({
            error: null,
            type: 'event',
            name: 'second',
            data: '{"name":"hello"}',
            status: 'in progress',
        });

        expect(actionSet.status).toEqual('input:in progress');

        actionSet.next();

        expect(actionSet.actions[1].raw).toEqual({
            error: null,
            type: 'event',
            name: 'second',
            data: '{"name":"hello"}',
            status: 'complete',
        });

        expect(actionSet.action.raw).toEqual({
            error: null,
            type: 'event',
            name: 'second',
            data: '{"name":"hello"}',
            status: 'complete',
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
            .setOwner({
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
            } as UserDto)
            .setActions(actions);

        expect(actionSet.actions).toEqual([
            {
                entity: {
                    error: null,
                    type: 'input',
                    name: 'first',
                    data: '{"name":"hello"}',
                    status: 'in progress',
                },
            },
            {
                entity: {
                    error: null,
                    type: 'event',
                    name: 'second',
                    data: '{"name":"hello"}',
                    status: 'in progress',
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
                },
            },
            {
                entity: {
                    error: null,
                    type: 'event',
                    name: 'second',
                    data: '{"name":"hello"}',
                    status: 'in progress',
                },
            },
        ]);
    });

    it('should get and set owner field', function() {
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
            .setOwner({
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
            } as UserDto)
            .setActions(actions);

        expect(actionSet.owner).toEqual('ccf2ef65-3632-4277-a061-dddfefac48da');
        actionSet.setOwner({
            id: 'ccf2ef65-3632-4277-a061-dddfefac48de',
        } as UserDto);
        expect(
            actionSet.isOwner({
                id: 'ccf2ef65-3632-4277-a061-dddfefac48de',
            } as UserDto),
        ).toBeTruthy();
        expect(actionSet.owner).toEqual('ccf2ef65-3632-4277-a061-dddfefac48de');
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
            .setOwner({
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
            } as UserDto)
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
            .setOwner({
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
            } as UserDto)
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
            .setOwner({
                id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
            } as UserDto)
            .setActions(actions);

        expect(actionSet.getQuery()).toEqual({
            id: 'ccf2ef65-3632-4277-a061-dddfefac48da',
        });
        expect(actionSet.withoutQuery()).toEqual({
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
            dispatched_at: actionSet.raw.dispatched_at,
        });
    });
});
