import Stripe from 'stripe';

/**
 * Data model returned when triggering a payout
 */
export class PaymentStripePayoutResponseDto {
    payout: Stripe.Payout;
}
