import { VenmasEntity, Sections } from '@lib/common/venmas/entities/Venmas.entity';

describe('Date Entity', function() {
    describe('constructor', function() {
        it('should build a venmas entity from nothing', function() {
            const venmasEntity = new VenmasEntity();

            expect(venmasEntity).toEqual({});
        });

        it('should build from venmas', function() {
            const section: Sections = {
                id: 'ab',
                type: 'ab',
                name: 'ab',
                description: 'ab',
                points: [[12, 12]],
            };

            const rawVenmasEntity: VenmasEntity = {
                id: 'abcd',
                name: 'abcd',
                owner: 'abcd',
                map: 'abcd',
                sections: section,
                created_at: new Date(),
                updated_at: new Date(),
            };

            const venmas = new VenmasEntity(rawVenmasEntity);

            expect(venmas).toEqual(rawVenmasEntity);
        });

        it('should build from venmas without id', function() {
            const section: Sections = {
                id: 'ab',
                type: 'ab',
                name: 'ab',
                description: 'ab',
                points: [[12, 12]],
            };

            const rawVenmasEntity: VenmasEntity = {
                id: null,
                name: 'abcd',
                owner: 'abcd',
                map: 'abcd',
                sections: section,
                created_at: new Date(),
                updated_at: new Date(),
            };

            const venmas = new VenmasEntity(rawVenmasEntity);

            expect(venmas).toEqual(rawVenmasEntity);
        });
    });
});
