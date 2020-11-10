import { PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { PurchaseError } from '@lib/common/purchases/ProductChecker.base.service';

/**
 * Data model returned when updating cart products
 */
export class PurchasesSetProductsResponseDto {
    /**
     * Updated cart entity
     */
    purchase?: PurchaseEntity;

    /**
     * Possible errors
     */
    errors?: PurchaseError[];
}
