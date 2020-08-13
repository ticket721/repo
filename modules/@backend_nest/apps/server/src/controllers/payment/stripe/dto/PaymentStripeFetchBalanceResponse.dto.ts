import Stripe from 'stripe';

export class PaymentStripeFetchBalanceResponseDto {
    balance: Stripe.Balance;
}
