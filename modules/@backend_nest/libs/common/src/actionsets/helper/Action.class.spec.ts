import { ActionEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { Action } from '@lib/common/actionsets/helper/Action.class';

describe('Action Helper', function() {
    it('should load existing entity', function() {
        const actionEntity: ActionEntity = {
            name: 'my action',
            status: 'in progress',
            error: null,
            type: 'input',
            data: '{"name": "lol"}',
        };

        const action: Action = new Action();
        expect(action.raw).toEqual({
            type: null,
            name: null,
            data: null,
            error: null,
            status: null,
        });
        action.load(actionEntity);

        expect(action.raw).toEqual(actionEntity);
    });

    it('should get & set name field', function() {
        const actionEntity: ActionEntity = {
            name: 'my action',
            status: 'in progress',
            error: null,
            type: 'input',
            data: '{"name": "lol"}',
        };

        const action: Action = new Action();
        action.load(actionEntity);

        expect(action.name).toEqual(actionEntity.name);
        action.setName('my other action');
        expect(action.name).toEqual('my other action');
    });

    it('should get & set status field', function() {
        const actionEntity: ActionEntity = {
            name: 'my action',
            status: 'in progress',
            error: null,
            type: 'input',
            data: '{"name": "lol"}',
        };

        const action: Action = new Action();
        action.load(actionEntity);

        expect(action.status).toEqual(actionEntity.status);
        action.setStatus('waiting');
        expect(action.status).toEqual('waiting');
    });

    it('should get & set error field', function() {
        const actionEntity: ActionEntity = {
            name: 'my action',
            status: 'in progress',
            error: null,
            type: 'input',
            data: '{"name": "lol"}',
        };

        const action: Action = new Action();
        action.load(actionEntity);

        expect(action.error).toEqual(null);
        action.setError({ reason: 'unexpected' });
        expect(action.error).toEqual({ reason: 'unexpected' });
    });

    it('should get & set data field', function() {
        const actionEntity: ActionEntity = {
            name: 'my action',
            status: 'in progress',
            error: null,
            type: 'input',
            data: '{"name": "lol"}',
        };

        const action: Action = new Action();
        action.load(actionEntity);

        expect(action.data).toEqual({ name: 'lol' });
        action.setData({ name: 'not lol' });
        expect(action.data).toEqual({ name: 'not lol' });
    });

    it('should get & set type field', function() {
        const actionEntity: ActionEntity = {
            name: 'my action',
            status: 'in progress',
            error: null,
            type: 'input',
            data: '{"name": "lol"}',
        };

        const action: Action = new Action();
        action.load(actionEntity);

        expect(action.type).toEqual('input');
        action.setType('event');
        expect(action.type).toEqual('event');
    });
});
