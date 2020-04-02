import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { ECAAG } from '@lib/common/utils/ECAAG.helper';

describe('Date Entity', function() {
    describe('constructor', function() {
        it('should build a date entity from nothing', function() {
            const dateEntity = new DateEntity();

            expect(dateEntity).toEqual({});
        });

        it('should build a date entity from raw date entity', function() {
            const rawDateEntity = {
                id: 'abcd',
                group_id: 'abcd',
                status: 'live',
                categories: [],
                location: {},
                timestamps: {},
                metadata: {},
                parent_id: 'abcd',
                parent_type: 'event',
                created_at: new Date(),
                updated_at: new Date(),
            } as DateEntity;

            const dateEntity = new DateEntity(rawDateEntity);

            expect(dateEntity).toEqual(rawDateEntity);
        });

        it('should build a date entity from raw date entity without id', function() {
            const rawDateEntity = {
                id: null,
                group_id: 'abcd',
                status: 'live',
                categories: [],
                location: {},
                timestamps: {},
                metadata: {},
                parent_id: null,
                parent_type: 'event',
                created_at: new Date(),
                updated_at: new Date(),
            } as DateEntity;

            const dateEntity = new DateEntity(rawDateEntity);

            expect(dateEntity).toEqual(rawDateEntity);
        });
    });
});
