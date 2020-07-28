import { Inject, Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';

/**
 * Stripe related functions and utilities
 */
@Injectable()
export class StripeService {
    /**
     * Dependency Injection
     *
     * @param stripeInstance
     */
    constructor(@Inject('STRIPE_INSTANCE') private readonly stripeInstance: Stripe) {}

    /**
     * Stripe Instance getter
     */
    get(): Stripe {
        return this.stripeInstance;
    }
}
