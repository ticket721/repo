import { GemOrderEntity } from '@lib/common/gemorders/entities/GemOrder.entity';

/**
 * Data Model returned upon succesful cart resolution
 */
export class ResolveCartWithPaymentIntentResponseDto {
    /**
     * Gem Order created for provided payment intent
     */
    gemOrder: GemOrderEntity;
}
