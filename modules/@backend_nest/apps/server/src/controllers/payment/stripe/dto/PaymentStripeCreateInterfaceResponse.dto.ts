import { StripeInterfaceEntity } from '@lib/common/stripeinterface/entities/StripeInterface.entity';

/**
 * Data Model returned when creating a stripe interface
 */
export class PaymentStripeCreateInterfaceResponseDto {
    /**
     * Created Stripe Interface
     */
    // tslint:disable-next-line:variable-name
    stripe_interface: StripeInterfaceEntity;
}
