import Stripe from 'stripe';

/**
 * Data model returned when recovering transactions
 */
export class PaymentStripeTransactionsResponseDto {
    /**
     * Transactions List object
     */
    transactions: Stripe.ApiList<Stripe.BalanceTransaction>;
}
