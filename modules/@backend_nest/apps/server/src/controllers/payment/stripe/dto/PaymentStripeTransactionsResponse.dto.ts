import Stripe from 'stripe';

/**
 * Data model returned when recovering transactions
 */
export class PaymentStripeTransactionsResponseDto {
    transactions: Stripe.ApiList<Stripe.BalanceTransaction>;
}
