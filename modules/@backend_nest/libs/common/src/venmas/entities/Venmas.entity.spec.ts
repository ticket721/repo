import { VenmasEntity } from '@lib/common/venmas/entities/Venmas.entity';

describe('Date Entity', function() {
    describe('constructor', function() {
        it('should build a venmas entity from nothing', function() {
            const venmasEntity = new VenmasEntity();

            expect(venmasEntity).toEqual({});
        });
    });
});
