import { StripeInterfaceEntity } from '@lib/common/stripeinterface/entities/StripeInterface.entity';

/**
 * Data model returned when setting default account for currency
 */
export class PaymentStripeSetDefaultExternalAccountResponseDto {
    /**
     * Updated stripe interface
     */
    // tslint:disable-next-line:variable-name
    stripe_interface: StripeInterfaceEntity;
}
