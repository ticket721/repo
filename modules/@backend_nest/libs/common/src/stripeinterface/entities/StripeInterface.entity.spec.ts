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
                connect_account_capabilities: [
                    {
                        name: 'transfer',
                        status: 'inactive',
                    },
                ],
                connect_account_current_deadline: new Date(1234),
                connect_account_currently_due: ['document'],
                connect_account_eventually_due: ['document'],
                connect_account_past_due: ['document'],
                connect_account_pending_verification: ['document'],
                connect_account_errors: [
                    {
                        code: 'error',
                        reason: 'an error occured',
                        requirement: 'document',
                    },
                ],
                connect_account_external_accounts: [
                    {
                        id: 'external_account_id',
                        fingerprint: 'fingerprint',
                        country: 'FR',
                        currency: 'eur',
                        last4: '3332',
                        name: 'BANK',
                        status: 'new',
                        default_for_currency: true,
                    },
                ],
                connect_account_name: 'Name',
                connect_account_type: 'business',
                connect_account_disabled_reason: 'past_due',
                id: 'stripe_interface_id',
                owner: 'owner_id',
                payment_methods: [
                    {
                        stripe_token: 'stripe_token_format',
                        type: 'card',
                    },
                ],
                connect_account: 'connect_account_token',
                connect_account_updated_at: now,
                updated_at: now,
                created_at: now,
            };

            const stripeInterface = new StripeInterfaceEntity(rawStripeInterface);

            expect(stripeInterface).toEqual(rawStripeInterface);
        });

        it('should properly build complete entity without IDs', function() {
            const now = new Date(Date.now());

            const rawStripeInterface: Omit<StripeInterfaceEntity, 'id' | 'owner'> = {
                connect_account_capabilities: [
                    {
                        name: 'transfer',
                        status: 'inactive',
                    },
                ],
                connect_account_current_deadline: new Date(1234),
                connect_account_currently_due: ['document'],
                connect_account_eventually_due: ['document'],
                connect_account_past_due: ['document'],
                connect_account_pending_verification: ['document'],
                connect_account_errors: [
                    {
                        code: 'error',
                        reason: 'an error occured',
                        requirement: 'document',
                    },
                ],
                connect_account_external_accounts: [
                    {
                        id: 'external_account_id',
                        fingerprint: 'fingerprint',
                        country: 'FR',
                        currency: 'eur',
                        last4: '3332',
                        name: 'BANK',
                        status: 'new',
                        default_for_currency: true,
                    },
                ],
                connect_account_name: 'Name',
                connect_account_type: 'business',
                connect_account_disabled_reason: 'past_due',
                payment_methods: [
                    {
                        stripe_token: 'stripe_token_format',
                        type: 'card',
                    },
                ],
                connect_account: 'connect_account_token',
                connect_account_updated_at: now,
                updated_at: now,
                created_at: now,
            };

            const stripeInterface = new StripeInterfaceEntity(rawStripeInterface as StripeInterfaceEntity);

            expect(stripeInterface).toEqual(rawStripeInterface);
        });
    });
});
