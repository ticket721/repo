import { PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { PurchaseError } from '@lib/common/purchases/ProductChecker.base.service';

/**
 * Data model returned when recovering the cart
 */
export class PurchasesFetchResponseDto {
    /**
     * Current purchase entity
     */
    cart: PurchaseEntity;

    /**
     * Possible errors
     */
    errors: PurchaseError[];
}
