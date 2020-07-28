import { StripeInterfaceEntity } from '@lib/common/stripeinterface/entities/StripeInterface.entity';

describe('StripeInterfaceEntity', function() {

    describe('constructor', function() {

        it('should properly build empty object', function() {

            const stripeInterface = new StripeInterfaceEntity();

            expect(stripeInterface).toEqual({});

        });

        it('should properly build complete entity', function() {

            const now = new Date(Date.now());

            const rawStripeInterface: StripeInterfaceEntity = {
                id: 'stripe_interface_id',
                owner: 'owner_id',
                payment_methods: [{
                    stripe_token: 'stripe_token_format',
                    type: 'card'
                }],
                connect_account: 'connect_account_token',
                connect_account_status: 'connect_account_status',
                connect_account_business_type: 'connect_account_business_type',
                connect_account_updated_at: now,
                updated_at: now,
                created_at: now
            };

            const stripeInterface = new StripeInterfaceEntity(rawStripeInterface);

            expect(stripeInterface).toEqual(rawStripeInterface);

        });

        it('should properly build complete entity without IDs', function() {

            const now = new Date(Date.now());

            const rawStripeInterface: Omit<StripeInterfaceEntity, 'id' | 'owner'> = {
                payment_methods: [{
                    stripe_token: 'stripe_token_format',
                    type: 'card'
                }],
                connect_account: 'connect_account_token',
                connect_account_status: 'connect_account_status',
                connect_account_business_type: 'connect_account_business_type',
                connect_account_updated_at: now,
                updated_at: now,
                created_at: now
            };

            const stripeInterface = new StripeInterfaceEntity(rawStripeInterface as StripeInterfaceEntity);

            expect(stripeInterface).toEqual(rawStripeInterface);

        });

    });

});
