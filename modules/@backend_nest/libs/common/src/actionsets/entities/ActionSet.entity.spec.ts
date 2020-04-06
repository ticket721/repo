import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';

describe('ActionSet Entity', function() {
    describe('constructor', function() {
        it('should build entity from nothing', function() {
            const actionSetEntity = new ActionSetEntity();

            expect(actionSetEntity).toEqual({});
        });

        it('should build entity from raw entity', function() {
            const rawActionSetEntity = {
                id: 'abcd',
                actions: [],
                links: [],
                current_action: 1,
                current_status: 'complete',
                name: 'acset',
                created_at: new Date(),
                updated_at: new Date(),
                dispatched_at: new Date(),
            } as ActionSetEntity;

            const actionSetEntity = new ActionSetEntity(rawActionSetEntity);

            expect(actionSetEntity).toEqual(rawActionSetEntity);
        });

        it('should build entity from raw entity without id', function() {
            const rawActionSetEntity = {
                id: null,
                actions: [],
                links: [],
                current_action: 1,
                current_status: 'complete',
                name: 'acset',
                created_at: new Date(),
                updated_at: new Date(),
                dispatched_at: new Date(),
            } as ActionSetEntity;

            const actionSetEntity = new ActionSetEntity(rawActionSetEntity);

            expect(actionSetEntity).toEqual(rawActionSetEntity);
        });
    });
});
