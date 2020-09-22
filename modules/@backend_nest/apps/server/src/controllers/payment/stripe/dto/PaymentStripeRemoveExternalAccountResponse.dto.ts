import { StripeInterfaceEntity } from '@lib/common/stripeinterface/entities/StripeInterface.entity';

/**
 * Data Model returned when removing an external account
 */
export class PaymentStripeRemoveExternalAccountResponseDto {
    /**
     * Updated stripe interface
     */
    // tslint:disable-next-line:variable-name
    stripe_interface: StripeInterfaceEntity;
}
