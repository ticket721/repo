import { StripeInterfaceEntity } from '@lib/common/stripeinterface/entities/StripeInterface.entity';

/**
 * Data Model returned when fetching stripe interface
 */
export class PaymentStripeFetchInterfaceResponseDto {
    /**
     * Current stripe interface
     */
    // tslint:disable-next-line:variable-name
    stripe_interface: StripeInterfaceEntity;
}
