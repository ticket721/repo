import { StripeResourceEntity } from '@lib/common/striperesources/entities/StripeResource.entity';

describe('StripeResource Entity', function() {
    describe('constructor', function() {
        it('should build entity with nothing', function() {
            const stripeResourceEntity = new StripeResourceEntity();

            expect(stripeResourceEntity).toEqual({});
        });

        it('should build entity with raw entity', function() {
            const rawStripeResourceEntity = {
                id: 'abcd',
                used_by: 'abcd',
                created_at: new Date(),
                updated_at: new Date(),
            } as StripeResourceEntity;

            const stripeResourceEntity = new StripeResourceEntity(rawStripeResourceEntity);

            expect(stripeResourceEntity).toEqual(rawStripeResourceEntity);
        });

        it('should build entity with raw entity without ids', function() {
            const rawStripeResourceEntity = {
                id: null,
                used_by: null,
                created_at: new Date(),
                updated_at: new Date(),
            } as StripeResourceEntity;

            const stripeResourceEntity = new StripeResourceEntity(rawStripeResourceEntity);

            expect(stripeResourceEntity).toEqual(rawStripeResourceEntity);
        });
    });
});
