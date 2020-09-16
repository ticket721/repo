import Stripe from 'stripe';

/**
 * Data Model required when fetching balance
 */
export class PaymentStripeFetchBalanceResponseDto {
    /**
     * Balance of the Account
     */
    balance: Stripe.Balance;
}
