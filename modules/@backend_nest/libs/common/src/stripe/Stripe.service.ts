import { Inject, Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';

/**
 * Stripe service used to manipulate the stripe client
 */
@Injectable()
export class StripeService {
    /**
     * Dependency Injection
     *
     * @param stripe
     */
    constructor(@Inject('STRIPE_INSTANCE') private readonly stripe: Stripe) {}

    /**
     * Instance getter
     */
    public get(): Stripe {
        return this.stripe;
    }

    /**
     * Helper to create a new customer
     *
     * @param userId
     */
    public async createCustomer(userId: string): Promise<ServiceResponse<string>> {
        try {
            const customer = await this.stripe.customers.create({
                description: `T721 User (${userId})`,
                metadata: {
                    id: userId,
                },
            });

            return {
                error: null,
                response: customer.id,
            };
        } catch (e) {
            return {
                error: 'cannot_create_customer',
                response: null,
            };
        }
    }
}
