/**
 * Data Model returned upon succesful cart resolution
 */
export class CheckoutResolveCartWithPaymentIntentResponseDto {
    /**
     * Gem Order created for provided payment intent
     */
    gemOrderId: string;

    /**
     * Checkout action set following the payment progress
     */
    checkoutActionSetId: string;
}
