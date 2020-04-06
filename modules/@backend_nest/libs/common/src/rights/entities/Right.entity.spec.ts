import { RightEntity } from '@lib/common/rights/entities/Right.entity';

describe('Right Entity', function() {
    describe('constructor', function() {
        it('should build from nothing', function() {
            const right = new RightEntity();

            expect(right).toEqual({});
        });

        it('should build from right', function() {
            const rawRightEntity: RightEntity = {
                grantee_id: 'abcd',
                entity_type: 'event',
                entity_value: 'abcd',
                rights: { owner: true },
                created_at: new Date(),
                updated_at: new Date(),
            };

            const right = new RightEntity(rawRightEntity);

            expect(right).toEqual(rawRightEntity);
        });

        it('should build from right without id', function() {
            const rawRightEntity: RightEntity = {
                grantee_id: null,
                entity_type: 'event',
                entity_value: 'abcd',
                rights: { owner: true },
                created_at: new Date(),
                updated_at: new Date(),
            };

            const right = new RightEntity(rawRightEntity);

            expect(right).toEqual(rawRightEntity);
        });
    });
});
