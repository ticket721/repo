import { StripeInterfaceEntity } from '@lib/common/stripeinterface/entities/StripeInterface.entity';

/**
 * Data Model returned when creating a connect account
 */
export class PaymentStripeCreateConnectAccountResponseDto {
    /**
     * Updated Stripe Interface
     */
    // tslint:disable-next-line:variable-name
    stripe_interface: StripeInterfaceEntity;
}
