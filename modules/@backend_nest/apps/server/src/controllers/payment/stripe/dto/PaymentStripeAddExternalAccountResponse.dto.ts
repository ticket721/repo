import { StripeInterfaceEntity } from '@lib/common/stripeinterface/entities/StripeInterface.entity';

/**
 * Data model returned when adding an external account
 */
export class PaymentStripeAddExternalAccountResponseDto {
    /**
     * Stripe interface
     */
    // tslint:disable-next-line:variable-name
    stripe_interface: StripeInterfaceEntity;
}
