import { StripeService } from '@lib/common/stripe/Stripe.service';
import Stripe from 'stripe';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';

describe('Stripe Service', function() {
    const context: {
        stripeService: StripeService;
        stripeMock: Stripe;
        stripeCustomersMock: Stripe.CustomersResource;
    } = {
        stripeService: null,
        stripeMock: null,
        stripeCustomersMock: null,
    };

    beforeEach(async function() {
        context.stripeMock = mock(Stripe);
        context.stripeCustomersMock = mock(Stripe.CustomersResource);

        when(context.stripeMock.customers).thenReturn(instance(context.stripeCustomersMock));

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StripeService,

                {
                    provide: 'STRIPE_INSTANCE',
                    useValue: instance(context.stripeMock),
                },
            ],
        }).compile();

        context.stripeService = module.get<StripeService>(StripeService);
    });

    describe('get', function() {
        it('should properly recover the stripe instance', function() {
            expect(context.stripeService.get()).toEqual(instance(context.stripeMock));
        });
    });

    describe('createCustomer', function() {
        it('should properly create a new customer', async function() {
            const user_id = 'user_id';
            const customer_id = 'cus_HHHHHHHHH';

            when(
                context.stripeCustomersMock.create(
                    deepEqual({
                        description: `T721 User (${user_id})`,
                        metadata: {
                            id: user_id,
                        },
                    }),
                ),
            ).thenResolve({
                id: customer_id,
            } as Stripe.Customer);

            const res = await context.stripeService.createCustomer(user_id);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(customer_id);

            verify(
                context.stripeCustomersMock.create(
                    deepEqual({
                        description: `T721 User (${user_id})`,
                        metadata: {
                            id: user_id,
                        },
                    }),
                ),
            ).times(1);
        });

        it('should fail on customer creation error', async function() {
            const user_id = 'user_id';

            when(
                context.stripeCustomersMock.create(
                    deepEqual({
                        description: `T721 User (${user_id})`,
                        metadata: {
                            id: user_id,
                        },
                    }),
                ),
            ).thenReject(new Error('cannot create customer'));

            const res = await context.stripeService.createCustomer(user_id);

            expect(res.error).toEqual('cannot_create_customer');
            expect(res.response).toEqual(null);

            verify(
                context.stripeCustomersMock.create(
                    deepEqual({
                        description: `T721 User (${user_id})`,
                        metadata: {
                            id: user_id,
                        },
                    }),
                ),
            ).times(1);
        });
    });
});
